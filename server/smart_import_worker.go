package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/daos"
	"github.com/pocketbase/pocketbase/models"
)

type SmartImportWorker struct {
	logger *slog.Logger
}

func NewSmartImportWorker(logger *slog.Logger) *SmartImportWorker {
	return &SmartImportWorker{logger: logger}
}

func (worker *SmartImportWorker) SmartImport(event *core.ModelEvent) error {
	if !event.Model.IsNew() {
		return nil
	}

	record, err := event.Dao.FindRecordById("smartImports", event.Model.GetId())
	if err != nil {
		return err
	}

	url := record.Get("url").(string)
	creator := record.Get("creator").(string)
	if url == "" {
		return fmt.Errorf("no url provided for recipe %s", record.Id)
	}

	rawRecipeText, err := ScrapeRecipe(url)
	if err != nil {
		UpdateImportFailureStatusOrLog(event.Dao, worker.logger, record.Id, url, err)
		return err
	}

	vertexResponse, err := ExtractRecipe(rawRecipeText)
	if err != nil {
		err = fmt.Errorf("failed to retreive parsed recipe from vertex: %w", err)
		UpdateImportFailureStatusOrLog(event.Dao, worker.logger, record.Id, url, err)
		return err
	}
	err = insertRecipe(event.Dao, vertexResponse, creator, record.Id, url)
	if err != nil {
		UpdateImportFailureStatusOrLog(event.Dao, worker.logger, record.Id, url, err)
		return err
	}

	return nil
}

func insertRecipe(dao *daos.Dao,
	vertexResponse VertexResponse, creator string, importRecordId string, url string) error {

	recipesCollection, err := dao.FindCollectionByNameOrId("recipes")
	if err != nil {
		return err
	}

	if dao == nil {
		return errors.New("unable to access database")
	}

	err = dao.RunInTransaction(func(txDao *daos.Dao) error {
		recipes := []string{}
		for _, recipe := range vertexResponse.Recipes {
			newRecipeRecord := models.NewRecord(recipesCollection)

			ingredients, err := json.Marshal(&IngredientsList{Ingredients: recipe.Ingredients})
			if err != nil {
				return err
			}

			instructions, err := json.Marshal(&InstructionsList{Instructions: recipe.Instructions})
			if err != nil {
				return err
			}

			newRecipeRecord.Set("name", recipe.Name)
			newRecipeRecord.Set("url", url)
			newRecipeRecord.Set("isDraft", true)
			newRecipeRecord.Set("totalTimeMinutes", recipe.TotalTimeMinutes)
			newRecipeRecord.Set("prepTimeMinutes", recipe.PrepTimeMinutes)
			newRecipeRecord.Set("creator", creator)
			newRecipeRecord.Set("ingredients", ingredients)
			newRecipeRecord.Set("instructions", instructions)

			err = txDao.SaveRecord(newRecipeRecord)
			if err != nil {
				return err
			}
			recipes = append(recipes, newRecipeRecord.Id)
		}

		smartImportRecord, err := dao.FindRecordById("smartImports", importRecordId)
		if err != nil {
			return err
		}

		smartImportRecord.Set("status", SmartImportStatusSuccess)
		smartImportRecord.Set("recipes", recipes)
		return txDao.SaveRecord(smartImportRecord)

	})

	return err
}
