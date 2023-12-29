package main

import (
	"log"
	"os"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

type SmartImportRequest struct {
	Url string `json:"url"`
}

// https://theinspiredhome.com/articles/authentic-street-tacos-for-tacotuesday/

func main() {
	app := pocketbase.New()

	// serves static files from the provided public dir (if exists)
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS("./pb_public"), false))
		e.Router.POST("/smartImport", func(c echo.Context) error {
			request := SmartImportRequest{}
			if err := c.Bind(&request); err != nil {
				ScrapeRecipe(request.Url)
			}

			return nil
		})
		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
