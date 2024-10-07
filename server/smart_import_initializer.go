package main

import (
	"fmt"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/daos"
	"github.com/pocketbase/pocketbase/models"
)

// SmartImportInitializer initializes smart import records upon receipt from the client.
// Initializing the records triggers a smart import job in the background.
type SmartImportInitializer struct {
	app *pocketbase.PocketBase
}

func NewSmartImportInitializer(app *pocketbase.PocketBase) *SmartImportInitializer {
	return &SmartImportInitializer{app: app}
}

func (initializer *SmartImportInitializer) Initialize(items []SmartImportItem,
	authRecord *models.Record) (map[string]string, error) {

	idToUrlMap := make(map[string]string)

	err := initializer.app.Dao().RunInTransaction(func(txDao *daos.Dao) error {
		for _, item := range items {
			importRecordId, err := initializer.insertSmartImport(txDao, item, authRecord)
			if err != nil {
				return err
			}
			if importRecordId == "" {
				return fmt.Errorf("creating a record did not return its id")
			}
			idToUrlMap[importRecordId] = item.Url
		}

		return nil
	})

	return idToUrlMap, err
}

func (initializer *SmartImportInitializer) insertSmartImport(
	txDao *daos.Dao,
	item SmartImportItem,
	authRecord *models.Record) (string, error) {
	smartImportsCollection, err := initializer.app.Dao().FindCollectionByNameOrId("smartImports")
	if err != nil {
		return "", err
	}

	newRecord := models.NewRecord(smartImportsCollection)
	newRecord.Set("creator", authRecord.Id)
	newRecord.Set("status", SmartImportStatusProcessing)
	if item.Url != "" {
		newRecord.Set("url", item.Url)
	}

	err = txDao.SaveRecord(newRecord)
	return newRecord.Id, err

}
