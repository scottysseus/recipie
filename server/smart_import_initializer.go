package main

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/daos"
	"github.com/pocketbase/pocketbase/models"
)

type SmartImportInitializer struct {
	app *pocketbase.PocketBase
}

func NewSmartImportInitializer(app *pocketbase.PocketBase) *SmartImportInitializer {
	return &SmartImportInitializer{app: app}
}

func (initializer *SmartImportInitializer) Initialize(items []SmartImportItem,
	authRecord *models.Record) (string, error) {

	importRecordIds := make([]string, len(items))
	var bulkId string

	err := initializer.app.Dao().RunInTransaction(func(txDao *daos.Dao) error {
		for i, item := range items {
			importRecordId, err := initializer.insertSmartImport(txDao, item, authRecord)
			if err != nil {
				return err
			}
			if importRecordId == "" {
				return fmt.Errorf("creating a record did not return its id")
			}
			importRecordIds[i] = importRecordId
		}
		var err error
		bulkId, err = initializer.insertBulkSmartImport(txDao, importRecordIds, authRecord)
		if err != nil {
			return err
		}

		return nil
	})

	return bulkId, err
}

func (initializer *SmartImportInitializer) insertBulkSmartImport(
	txDao *daos.Dao,
	items []string,
	authRecord *models.Record) (string, error) {
	bulkCollection, err := initializer.app.Dao().FindCollectionByNameOrId("bulkSmartImports")
	if err != nil {
		return "", err
	}

	newRecord := models.NewRecord(bulkCollection)
	newRecord.Set("creator", authRecord.Id)
	newRecord.Set("imports", items)
	newRecord.Set("status", SmartImportStatusProcessing)

	return newRecord.Id, txDao.SaveRecord(newRecord)
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
	} else if item.RawText != "" {
		newRecord.Set("rawText", item.RawText)
	}

	err = txDao.SaveRecord(newRecord)
	return newRecord.Id, err

}

func (initializer *SmartImportInitializer) acceptSmartImportCompletions(id string, numImports int, completeC <-chan bool) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute*15)
	defer cancel()
	completeCount := 0
	status := SmartImportStatusSuccess

	for ; completeCount < numImports; completeCount++ {
		select {
		case result := <-completeC:
			if !result {
				status = SmartImportStatusError
			}
		case <-ctx.Done():
			initializer.updateBulkRecordOnCompletion(id, SmartImportStatusError, errors.New(ErrorInternalTimeout))
			return
		}
	}

	initializer.updateBulkRecordOnCompletion(id, status, nil)
}

func (initializer *SmartImportInitializer) updateBulkRecordOnCompletion(id string, status string, importErr error) {
	record, err := initializer.app.Dao().FindRecordById("bulkSmartImports", id)
	if err != nil {
		UpdateImportFailureStatusOrLog(initializer.app, id, "bulkSmartImports", err)
		return
	}

	record.Set("status", status)
	if importErr != nil {
		record.Set("error", ErrorFieldValueFromError(importErr))
	}
	err = initializer.app.Dao().SaveRecord(record)
	if err != nil {
		UpdateImportFailureStatusOrLog(initializer.app, id, "bulkSmartImports", err)
		return
	}
}
