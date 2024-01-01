package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"regexp"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/daos"
	"github.com/pocketbase/pocketbase/models"
	"golang.org/x/net/html"
)

func ScrapeRecipe(app *pocketbase.PocketBase, authRecord *models.Record, recipeUrl string, resultC chan<- []string, errC chan<- error) {
	imgRegex := regexp.MustCompile("<img .*>")
	singlespaceRegex := regexp.MustCompile("[ ]{2,}")
	anySpaceRegex := regexp.MustCompile("[\\s]{2,}")

	c := colly.NewCollector()

	c.OnHTML("body", func(e *colly.HTMLElement) {
		app.Logger().Debug("found HTML body", "url", recipeUrl)
		e.DOM.Find("img, script, style").Remove()
		childTexts := childTexts(e, ":not(img, script, style)")
		longestLength := 0
		longestChild := ""

		for i := 0; i < len(childTexts); i++ {
			if len(childTexts[i]) > longestLength {
				longestChild = childTexts[i]
				longestLength = len(longestChild)
			}
		}

		text := imgRegex.ReplaceAllString(longestChild, " ")
		text = singlespaceRegex.ReplaceAllString(text, " ")
		text = anySpaceRegex.ReplaceAllString(text, "\n")
		vertexResponse, err := ExtractRecipe(text)
		if err != nil {
			errC <- err
			return
		}

		app.Logger().Debug("extracted recipe", "url", recipeUrl, "recipeCount", len(vertexResponse.Recipes), "firstRecipeName", vertexResponse.Recipes[0].Name)

		ingredientsCollection, err := app.Dao().FindCollectionByNameOrId("ingredients")
		if err != nil {
			errC <- err
			return
		}

		recipesCollection, err := app.Dao().FindCollectionByNameOrId("recipes")
		if err != nil {
			errC <- err
			return
		}

		if app.Dao() == nil {
			errC <- fmt.Errorf("unable to access database")
			return
		}

		app.Dao().RunInTransaction(func(txDao *daos.Dao) error {

			recipes := []string{}
			for _, recipe := range vertexResponse.Recipes {
				ingredients := []string{}
				for _, ingredient := range recipe.Ingredients {
					newIngredientRecord := models.NewRecord(ingredientsCollection)

					newIngredientRecord.Set("name", ingredient.Name)
					newIngredientRecord.Set("quantity", ingredient.Quantity)
					newIngredientRecord.Set("unit", ingredient.Unit)
					newIngredientRecord.Set("preparation", ingredient.Preparation)
					newIngredientRecord.Set("creator", authRecord.Id)

					txDao.SaveRecord(newIngredientRecord)
					ingredients = append(ingredients, newIngredientRecord.Id)
				}
				newRecipeRecord := models.NewRecord(recipesCollection)
				instructions, err := json.Marshal(&VertexRecipe{Instructions: recipe.Instructions})
				if err != nil {
					errC <- err
					return err
				}

				newRecipeRecord.Set("name", recipe.Name)
				newRecipeRecord.Set("isDraft", true)
				newRecipeRecord.Set("totalTimeMinutes", recipe.TotalTimeMinutes)
				newRecipeRecord.Set("prepTimeMinutes", recipe.PrepTimeMinutes)
				newRecipeRecord.Set("creator", authRecord.Id)
				newRecipeRecord.Set("ingredients", ingredients)
				newRecipeRecord.Set("instructions", instructions)

				txDao.SaveRecord(newRecipeRecord)
				recipes = append(recipes, newRecipeRecord.Id)
			}

			app.Logger().Debug("created recipes", "url", recipeUrl, "recipes", recipes)

			resultC <- recipes
			return nil
		})
	})

	c.Visit(recipeUrl)
}

func childTexts(h *colly.HTMLElement, goquerySelector string) []string {
	var res []string
	h.DOM.Find(goquerySelector).Each(func(_ int, s *goquery.Selection) {
		res = append(res, " "+selectionToText(s)+" ")
	})
	return res
}

func selectionToText(s *goquery.Selection) string {
	var buf bytes.Buffer

	// Slightly optimized vs calling Each: no single selection object created
	var f func(*html.Node)
	f = func(n *html.Node) {
		if n.Type == html.TextNode {
			// Keep newlines and spaces, like jQuery
			buf.WriteString(n.Data)
			buf.WriteString("\n")
		}
		if n.FirstChild != nil {
			for c := n.FirstChild; c != nil; c = c.NextSibling {
				f(c)
			}
		}
	}
	for _, n := range s.Nodes {
		f(n)
	}

	return buf.String()
}
