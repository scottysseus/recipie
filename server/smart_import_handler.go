package main

import (
	"encoding/json"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/models"
)

type SmartImportHandler struct {
	app         *pocketbase.PocketBase
	initializer *SmartImportInitializer
}

func NewSmartImportHandler(app *pocketbase.PocketBase, initializer *SmartImportInitializer) *SmartImportHandler {
	return &SmartImportHandler{app: app, initializer: initializer}
}

func (handler *SmartImportHandler) SmartImport(reqCtx echo.Context, authRecord *models.Record) error {
	var request SmartImportRequest
	if err := json.NewDecoder(reqCtx.Request().Body).Decode(&request); err != nil {
		return reqCtx.JSON(400, &ErrorResponse{Code: ErrorBadJson, Error: err.Error()})
	}

	idToUrlMap, err := handler.initializer.Initialize(request.Items, authRecord)
	if err != nil {
		return reqCtx.JSON(500, &ErrorResponse{Code: ErrorInternalDatabase, Error: err.Error()})
	}

	imports := make([]UrlImport, len(request.Items))
	for key, value := range idToUrlMap {
		imports = append(imports, UrlImport{
			Id: key,
			Url: value,
		})
	}

	return reqCtx.JSON(200, &SmartImportResponse{UrlImports: imports})

}
