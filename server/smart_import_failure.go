package main

import (
	"fmt"

	"github.com/pocketbase/pocketbase"
)

func UpdateImportFailureStatusOrLog(app *pocketbase.PocketBase,
	id string, collection string, importErr error) {
	record, err := app.Dao().FindRecordById(collection, id)
	if err != nil {
		app.Logger().Error("failed to retrieve import record after encountering an error",
			"id", id, "collection", collection, "importErr", importErr, "err", err)
		return
	}

	record.Set("status", SmartImportStatusError)
	record.Set("error", ErrorFieldValueFromError(importErr))
	err = app.Dao().SaveRecord(record)
	if err != nil {
		app.Logger().Error("failed to update import status after encountering an error",
			"id", id, "collection", collection, "importErr", importErr, "err", err)
		return
	}
}

func ErrorFieldValueFromError(err error) string {
	return fmt.Sprintf("{\"error\": \"%s\"}", err.Error())
}
