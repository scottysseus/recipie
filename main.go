package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
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
		e.Router.GET("/hello/:name", func(c echo.Context) error {
			name := c.PathParam("name")
			fmt.Println("hello " + name)
			return c.JSON(http.StatusOK, map[string]string{"message": "Hello " + name})
		} /* optional middlewares */)
		e.Router.POST("/smartImport", func(c echo.Context) error {
			fmt.Println("smartImport request received")
			var request SmartImportRequest
			if err := json.NewDecoder(c.Request().Body).Decode(&request); err != nil {
				fmt.Println("error in smartImport request")
				fmt.Println(err)
				return nil
			}

			if len(request.Url) < 1 {
				fmt.Println("request did not contain a url")
				return c.String(400, "request must contain a url")
			}

			resultC := make(chan string)
			errC := make(chan error)
			fmt.Println("scraping recipe")
			go ScrapeRecipe(request.Url, resultC, errC)

			select {
			case err := <-errC:
				return c.String(400, err.Error())
			case recipe := <-resultC:
				return c.String(200, recipe)
			}
		})
		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
