package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

type SmartImportRequest struct {
	Url string `json:"url"`
}

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

	// serves static files from the provided public dir (if exists)
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/hello/:name", func(c echo.Context) error {
			name := c.PathParam("name")
			return c.JSON(http.StatusOK, map[string]string{"message": "Hello " + name})
		} /* optional middlewares */)
		e.Router.POST("/smartImport", func(c echo.Context) error {
			info := apis.RequestInfo(c)

			authRecord := info.AuthRecord
			if authRecord == nil {
				return c.String(500, "unable to extract auth record")
			}

			var request SmartImportRequest
			if err := json.NewDecoder(c.Request().Body).Decode(&request); err != nil {
				return nil
			}

			if len(request.Url) < 1 {
				return c.String(400, "request must contain a url")
			}

			resultC := make(chan []string)
			errC := make(chan error)
			go ScrapeRecipe(app, authRecord, request.Url, resultC, errC)

			select {
			case err := <-errC:
				return c.String(400, err.Error())
			case recipes := <-resultC:
				return c.JSON(200, &SmartImportResponse{Recipes: recipes})
			}
		}, apis.RequireRecordAuth())
		return nil
	})

	if err := app.Bootstrap(); err != nil {
		log.Println("failed to bootstrap")
		log.Fatal(err)
	}

	if err := app.Start(); err != nil {
		log.Println("failed to start")
		log.Fatal(err)
	}
}
