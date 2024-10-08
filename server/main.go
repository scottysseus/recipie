package main

import (
	"log"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	_ "github.com/scottysseus/recipie/migrations"
)

// https://theinspiredhome.com/articles/authentic-street-tacos-for-tacotuesday/
// https://www.pillsbury.com/recipes/classic-chicken-pot-pie/1401d418-ac0b-4b50-ad09-c6f1243fb992
// https://www.savethestudent.org/save-money/food-drink/6-delicious-recipes-you-can-make-with-baked-beans.html
// https://www.sweetestmenu.com/dark-chocolate-almond-fudge/

func main() {
	app := pocketbase.New()

	initializer := NewSmartImportInitializer(app)
	smartImportHandler := NewSmartImportHandler(app, initializer)
	worker := NewSmartImportWorker(app.Logger())

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

	app.OnModelAfterUpdate("smartImports").Add(worker.SmartImport)

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{})

	if err := app.Start(); err != nil {
		log.Println("failed to start")
		log.Fatal(err)
	}
}
