package main

import (
	"log"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

// https://theinspiredhome.com/articles/authentic-street-tacos-for-tacotuesday/
// https://www.pillsbury.com/recipes/classic-chicken-pot-pie/1401d418-ac0b-4b50-ad09-c6f1243fb992

func main() {
	app := pocketbase.New()

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		if err := InitDb(app); err != nil {
			return err
		}
		return nil
	})

	smartImportService := NewSmartImportService(app)
	smartImportHandler := NewSmartImportHandler(app, smartImportService)

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.POST("/smartImport", func(c echo.Context) error {
			info := apis.RequestInfo(c)

			authRecord := info.AuthRecord
			if authRecord == nil {
				return c.String(500, "unable to extract auth record")
			}

			return smartImportHandler.SmartImport(c, authRecord)
		}, apis.RequireRecordAuth())
		return nil
	})

	if err := app.Start(); err != nil {
		log.Println("failed to start")
		log.Fatal(err)
	}
}
