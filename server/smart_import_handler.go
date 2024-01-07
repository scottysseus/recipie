package main

import (
	"encoding/json"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/daos"
	"github.com/pocketbase/pocketbase/models"
)

type SmartImportRequest struct {
	Items []SmartImportItem `json:"items"`
}

type SmartImportItem struct {
	Url     string `json:"url"`
	RawText string `json:"rawText"`
}

type SmartImportResponse struct {
	Id string `json:"id"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

const (
	SmartImportErrorEmptyItem = "smartImport.emptyItem"
	ErrorBadJson              = "common.badJson"
)

const (
	SmartImportStatusProcessing = "processing"
	SmartImportStatusError      = "error"
	SmartImportStatusSuccess    = "success"
)

type SmartImportHandler struct {
	app           *pocketbase.PocketBase
	importService *SmartImportService
}

func NewSmartImportHandler(app *pocketbase.PocketBase, importService *SmartImportService) *SmartImportHandler {
	return &SmartImportHandler{app: app, importService: importService}
}

func (handler *SmartImportHandler) SmartImport(reqCtx echo.Context, authRecord *models.Record) error {
	var request SmartImportRequest
	if err := json.NewDecoder(reqCtx.Request().Body).Decode(&request); err != nil {
		reqCtx.JSON(400, &ErrorResponse{Error: ErrorBadJson})
		return nil
	}

	importRecordIds := make([]string, len(request.Items))
	var id string

	err := handler.app.Dao().RunInTransaction(func(txDao *daos.Dao) error {
		for _, item := range request.Items {
			id, err := handler.insertSmartImport(txDao, item, authRecord)
			if err != nil {
				return err
			}
			importRecordIds = append(importRecordIds, id)
		}
		var err error
		id, err = handler.insertBulkSmartImport(txDao, importRecordIds, authRecord)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return err
	}

	// now kick off all the smart imports
	for i, item := range request.Items {
		go handler.importService.SmartImport(ImportParameters{Url: item.Url, RawText: item.RawText, ImportRecordId: importRecordIds[i]}, authRecord)
	}

	reqCtx.JSON(200, &SmartImportResponse{Id: id})

	return nil
}

func (handler *SmartImportHandler) insertBulkSmartImport(txDao *daos.Dao, items []string, authRecord *models.Record) (string, error) {
	bulkCollection, err := handler.app.Dao().FindCollectionByNameOrId("bulkSmartImports")
	if err != nil {
		return "", err
	}

	newRecord := models.NewRecord(bulkCollection)
	newRecord.Set("creator", authRecord.Id)
	newRecord.Set("imports", items)

	return newRecord.Id, txDao.SaveRecord(newRecord)
}

func (handler *SmartImportHandler) insertSmartImport(txDao *daos.Dao, item SmartImportItem, authRecord *models.Record) (string, error) {
	smartImportsCollection, err := handler.app.Dao().FindCollectionByNameOrId("smartImports")
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

	return newRecord.Id, txDao.SaveRecord(newRecord)

}
