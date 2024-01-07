package main

import (
	"database/sql"

	"github.com/pocketbase/pocketbase/tools/types"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/models/schema"
)

func InitDb(app *pocketbase.PocketBase) error {
	userCollection, err := app.Dao().FindCollectionByNameOrId("users")
	if err != nil {
		return err
	}

	ingredientsCollection := &models.Collection{
		Name: "ingredients",
		Type: models.CollectionTypeBase,
		Schema: schema.NewSchema(&schema.SchemaField{
			Name:     "name",
			Required: true,
			Type:     schema.FieldTypeText,
		}, &schema.SchemaField{
			Name: "creator",
			Type: schema.FieldTypeRelation,
			Options: &schema.RelationOptions{
				MaxSelect:    types.Pointer(1),
				CollectionId: userCollection.Id,
			},
		}, &schema.SchemaField{
			Name: "quantity",
			Type: schema.FieldTypeNumber,
		}, &schema.SchemaField{
			Name: "unit",
			Type: schema.FieldTypeText,
		}, &schema.SchemaField{
			Name: "preparation",
			Type: schema.FieldTypeText,
		}),
		ListRule:   types.Pointer("@request.auth.id != ''"),
		ViewRule:   types.Pointer("@request.auth.id != ''"),
		CreateRule: types.Pointer("@request.auth.id != ''"),
		UpdateRule: types.Pointer("@request.auth.id != ''"),
		DeleteRule: types.Pointer("@request.auth.id != ''"),
	}

	if err = createIfNotExist(app, ingredientsCollection); err != nil {
		return err
	}

	recipesCollection := &models.Collection{
		Name: "recipes",
		Type: models.CollectionTypeBase,
		Schema: schema.NewSchema(&schema.SchemaField{
			Name:     "name",
			Required: true,
			Type:     schema.FieldTypeText,
		}, &schema.SchemaField{
			Name: "isDraft",
			Type: schema.FieldTypeBool,
		}, &schema.SchemaField{
			Name: "creator",
			Type: schema.FieldTypeRelation,
			Options: &schema.RelationOptions{
				MaxSelect:    types.Pointer(1),
				CollectionId: userCollection.Id,
			},
		}, &schema.SchemaField{
			Name: "totalTimeMinutes",
			Type: schema.FieldTypeText,
		}, &schema.SchemaField{
			Name: "prepTimeMinutes",
			Type: schema.FieldTypeText,
		}, &schema.SchemaField{
			Name: "ingredients",
			Type: schema.FieldTypeRelation,
			Options: &schema.RelationOptions{
				CollectionId: ingredientsCollection.Id,
			},
		}, &schema.SchemaField{
			Name: "instructions",
			Type: schema.FieldTypeJson,
		}),
		ListRule:   types.Pointer("@request.auth.id != ''"),
		ViewRule:   types.Pointer("@request.auth.id != ''"),
		CreateRule: types.Pointer("@request.auth.id != ''"),
		UpdateRule: types.Pointer("@request.auth.id != ''"),
		DeleteRule: types.Pointer("@request.auth.id != ''"),
	}
	if err = createIfNotExist(app, recipesCollection); err != nil {
		return err
	}

	smartImportsCollection := &models.Collection{
		Name: "smartImports",
		Type: models.CollectionTypeBase,
		Schema: schema.NewSchema(&schema.SchemaField{
			Name: "creator",
			Type: schema.FieldTypeRelation,
			Options: &schema.RelationOptions{
				MaxSelect:    types.Pointer(1),
				CollectionId: userCollection.Id,
			},
		}, &schema.SchemaField{
			Name: "status",
			Type: schema.FieldTypeSelect,
			Options: &schema.SelectOptions{
				Values: []string{"success", "error", "processing"},
			},
		}, &schema.SchemaField{
			Name: "url",
			Type: schema.FieldTypeText,
		}, &schema.SchemaField{
			Name: "rawText",
			Type: schema.FieldTypeText,
		}, &schema.SchemaField{
			Name: "error",
			Type: schema.FieldTypeJson,
		}, &schema.SchemaField{
			Name: "recipes",
			Type: schema.FieldTypeRelation,
			Options: &schema.RelationOptions{
				CollectionId: recipesCollection.Id,
			},
		}),
		ListRule:   types.Pointer("@request.auth.id != ''"),
		ViewRule:   types.Pointer("@request.auth.id != ''"),
		CreateRule: types.Pointer("@request.auth.id != ''"),
		UpdateRule: types.Pointer("@request.auth.id != ''"),
		DeleteRule: types.Pointer("@request.auth.id != ''"),
	}

	smartImportsCollection.Schema.AddField(&schema.SchemaField{
		Name: "parent",
		Type: schema.FieldTypeRelation,
		Options: &schema.RelationOptions{
			MaxSelect:    types.Pointer(1),
			CollectionId: smartImportsCollection.Id,
		},
	})
	if err = createIfNotExist(app, smartImportsCollection); err != nil {
		return err
	}

	bulkSmartImportsCollection := &models.Collection{
		Name: "bulkSmartImports", Type: models.CollectionTypeBase,
		Schema: schema.NewSchema(&schema.SchemaField{
			Name: "creator",
			Type: schema.FieldTypeRelation,
			Options: &schema.RelationOptions{
				MaxSelect:    types.Pointer(1),
				CollectionId: userCollection.Id,
			},
		}, &schema.SchemaField{
			Name: "imports",
			Type: schema.FieldTypeRelation,
			Options: &schema.RelationOptions{
				CollectionId: smartImportsCollection.Id,
			},
		}),
		ListRule:   types.Pointer("@request.auth.id != ''"),
		ViewRule:   types.Pointer("@request.auth.id != ''"),
		CreateRule: types.Pointer("@request.auth.id != ''"),
		UpdateRule: types.Pointer("@request.auth.id != ''"),
		DeleteRule: types.Pointer("@request.auth.id != ''"),
	}

	return createIfNotExist(app, bulkSmartImportsCollection)
}

func createIfNotExist(app *pocketbase.PocketBase, collection *models.Collection) error {
	existingCollection, err := app.Dao().FindCollectionByNameOrId(collection.Name)
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	if existingCollection == nil {
		if err := app.Dao().SaveCollection(collection); err != nil {
			return err
		}
	}

	return nil
}
