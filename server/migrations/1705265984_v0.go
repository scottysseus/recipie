package migrations

import (
	"database/sql"

	"github.com/pocketbase/pocketbase/daos"
	"github.com/pocketbase/pocketbase/tools/types"

	"github.com/pocketbase/dbx"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/models/schema"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		// add up queries...

		dao := daos.New(db)

		return initSchema(dao)
	}, func(db dbx.Builder) error {
		// add down queries...

		return nil
	})
}

func initSchema(dao *daos.Dao) error {
	userCollection, err := dao.FindCollectionByNameOrId("users")
	if err != nil {
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
		},&schema.SchemaField{
			Name: "url",
			Type: schema.FieldTypeText,
		}, &schema.SchemaField{
			Name: "totalTimeMinutes",
			Type: schema.FieldTypeText,
		}, &schema.SchemaField{
			Name: "prepTimeMinutes",
			Type: schema.FieldTypeText,
		}, &schema.SchemaField{
			Name: "ingredients",
			Type: schema.FieldTypeJson,
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
	if err = createIfNotExist(dao, recipesCollection); err != nil {
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
	return createIfNotExist(dao, smartImportsCollection)
}

func createIfNotExist(dao *daos.Dao, collection *models.Collection) error {
	existingCollection, err := dao.FindCollectionByNameOrId(collection.Name)
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	if existingCollection == nil {
		if err := dao.SaveCollection(collection); err != nil {
			return err
		}
	}

	return nil
}
