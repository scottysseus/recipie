package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

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
	Code  string `json:"code"`
	Error string `json:"error"`
}

const (
	SmartImportErrorEmptyItem = "smartImport.emptyItem"
	ErrorBadJson              = "common.badJson"
	ErrorInternalDatabase     = "common.internal.database"
	ErrorInternalTimeout      = "common.internal.timeout"
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
		return reqCtx.JSON(400, &ErrorResponse{Code: ErrorBadJson, Error: err.Error()})
	}

	importRecordIds := make([]string, len(request.Items))
	var bulkId string

	err := handler.app.Dao().RunInTransaction(func(txDao *daos.Dao) error {
		for i, item := range request.Items {
			importRecordId, err := handler.insertSmartImport(txDao, item, authRecord)
			if err != nil {
				return reqCtx.JSON(500, &ErrorResponse{Code: ErrorInternalDatabase, Error: err.Error()})
			}
			if importRecordId == "" {
				return reqCtx.JSON(500, &ErrorResponse{
					Code: ErrorInternalDatabase, Error: "creating a record did not return its id"})
			}
			importRecordIds[i] = importRecordId
		}
		var err error
		bulkId, err = handler.insertBulkSmartImport(txDao, importRecordIds, authRecord)
		if err != nil {
			return reqCtx.JSON(500, &ErrorResponse{Code: ErrorInternalDatabase, Error: err.Error()})
		}

		return nil
	})
	if err != nil {
		return reqCtx.JSON(500, &ErrorResponse{Code: ErrorInternalDatabase, Error: err.Error()})
	}

	completeC := make(chan bool, len(request.Items))

	// now kick off all the smart imports
	for i, item := range request.Items {
		params := ImportParameters{Url: item.Url, RawText: item.RawText, ImportRecordId: importRecordIds[i]}
		if importRecordIds[i] == "" {
			identifier := item.RawText[0:64]
			if identifier == "" {
				identifier = item.Url
			}
			UpdateImportFailureStatusOrLog(handler.app,
				importRecordIds[i], "smartImports", fmt.Errorf("no smartImports record for '%s'", identifier))
			continue
		}
		go handler.importService.SmartImport(params, authRecord, completeC)
	}

	go handler.acceptSmartImportCompletions(bulkId, len(importRecordIds), completeC)

	return reqCtx.JSON(200, &SmartImportResponse{Id: bulkId})

}

func (handler *SmartImportHandler) insertBulkSmartImport(
	txDao *daos.Dao,
	items []string,
	authRecord *models.Record) (string, error) {
	bulkCollection, err := handler.app.Dao().FindCollectionByNameOrId("bulkSmartImports")
	if err != nil {
		return "", err
	}

	newRecord := models.NewRecord(bulkCollection)
	newRecord.Set("creator", authRecord.Id)
	newRecord.Set("imports", items)
	newRecord.Set("status", SmartImportStatusProcessing)

	return newRecord.Id, txDao.SaveRecord(newRecord)
}

func (handler *SmartImportHandler) insertSmartImport(
	txDao *daos.Dao,
	item SmartImportItem,
	authRecord *models.Record) (string, error) {
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

	err = txDao.SaveRecord(newRecord)
	return newRecord.Id, err

}

func (handler *SmartImportHandler) acceptSmartImportCompletions(id string, numImports int, completeC <-chan bool) {
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
			handler.updateBulkRecordOnCompletion(id, SmartImportStatusError, errors.New(ErrorInternalTimeout))
			return
		}
	}

	handler.updateBulkRecordOnCompletion(id, status, nil)
}

func (handler *SmartImportHandler) updateBulkRecordOnCompletion(id string, status string, importErr error) {
	record, err := handler.app.Dao().FindRecordById("bulkSmartImports", id)
	if err != nil {
		UpdateImportFailureStatusOrLog(handler.app, id, "bulkSmartImports", err)
		return
	}

	record.Set("status", status)
	if importErr != nil {
		record.Set("error", ErrorFieldValueFromError(importErr))
	}
	err = handler.app.Dao().SaveRecord(record)
	if err != nil {
		UpdateImportFailureStatusOrLog(handler.app, id, "bulkSmartImports", err)
		return
	}
}
