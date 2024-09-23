package main

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/daos"
	"github.com/pocketbase/pocketbase/models"
)

type SmartImportService struct {
	app *pocketbase.PocketBase
}

type ImportParameters struct {
	Url            string
	RawText        string
	ImportRecordId string
}

func NewSmartImportService(app *pocketbase.PocketBase) *SmartImportService {
	return &SmartImportService{app: app}
}

// SmartImport attempts to import recipes from the given parameters, either a URL or raw text.
// It sends a completion signal (true for success, false for error) to the completC channel.
func (service *SmartImportService) SmartImport(params ImportParameters, authRecord *models.Record, completeC chan<- bool) {

	var rawRecipeText string
	var err error
	if params.Url != "" {
		rawRecipeText, err = ScrapeRecipe(params.Url)
		if err != nil {
			UpdateImportFailureStatusOrLog(service.app, params.ImportRecordId, "smartImports", err)
			completeC <- false
			return
		}
	} else {
		rawRecipeText = params.RawText
	}

	vertexResponse, err := ExtractRecipe(rawRecipeText)
	if err != nil {
		err = fmt.Errorf("failed to retreive parsed recipe from vertex: %w", err)
		UpdateImportFailureStatusOrLog(service.app, params.ImportRecordId, "smartImports", err)
		completeC <- false
		return
	}
	err = insertRecipe(service.app, vertexResponse, authRecord, params.ImportRecordId)
	if err != nil {
		UpdateImportFailureStatusOrLog(service.app, params.ImportRecordId, "smartImports", err)
		completeC <- false
		return
	}

	// send a success signal to the channel
	completeC <- true
}

func insertRecipe(app *pocketbase.PocketBase,
	vertexResponse VertexResponse, authRecord *models.Record, importRecordId string) error {
	ingredientsCollection, err := app.Dao().FindCollectionByNameOrId("ingredients")
	if err != nil {
		return err
	}

	recipesCollection, err := app.Dao().FindCollectionByNameOrId("recipes")
	if err != nil {
		return err
	}

	if app.Dao() == nil {
		return errors.New("unable to access database")
	}

	err = app.Dao().RunInTransaction(func(txDao *daos.Dao) error {
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

				err := txDao.SaveRecord(newIngredientRecord)
				if err != nil {
					return err
				}
				ingredients = append(ingredients, newIngredientRecord.Id)
			}
			newRecipeRecord := models.NewRecord(recipesCollection)
			instructions, err := json.Marshal(&VertexRecipe{Instructions: recipe.Instructions})
			if err != nil {
				return err
			}

			newRecipeRecord.Set("name", recipe.Name)
			newRecipeRecord.Set("isDraft", true)
			newRecipeRecord.Set("totalTimeMinutes", recipe.TotalTimeMinutes)
			newRecipeRecord.Set("prepTimeMinutes", recipe.PrepTimeMinutes)
			newRecipeRecord.Set("creator", authRecord.Id)
			newRecipeRecord.Set("ingredients", ingredients)
			newRecipeRecord.Set("instructions", instructions)

			err = txDao.SaveRecord(newRecipeRecord)
			if err != nil {
				return err
			}
			recipes = append(recipes, newRecipeRecord.Id)
		}

		smartImportRecord, err := app.Dao().FindRecordById("smartImports", importRecordId)
		if err != nil {
			return err
		}

		smartImportRecord.Set("status", SmartImportStatusSuccess)
		smartImportRecord.Set("recipes", recipes)
		return txDao.SaveRecord(smartImportRecord)

	})

	return err
}
