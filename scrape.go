package main

import (
	"github.com/gocolly/colly"
)

func ScrapeRecipe(recipeUrl string) {
	c := colly.NewCollector()

	c.OnHTML("body", func(e *colly.HTMLElement) {
		ExtractRecipe(e.ChildText("body > *"))
	})

	c.Visit(recipeUrl)
}
