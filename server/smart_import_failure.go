package main

import (
	"fmt"
	"log/slog"

	"github.com/pocketbase/pocketbase/daos"
)

func UpdateImportFailureStatusOrLog(dao *daos.Dao, logger *slog.Logger,
	id string, url string, importErr error) {
	record, err := dao.FindRecordById("smartImports", id)
	if err != nil {
		logger.Error("failed to retrieve import record after encountering an error",
			"id", id, "collection", "smartImports", "importErr", importErr, "err", err)
		return
	}

	record.Set("status", SmartImportStatusError)
	record.Set("error", ErrorFieldValueFromError(importErr))
	record.Set("url", url)
	err = dao.SaveRecord(record)
	if err != nil {
		logger.Error("failed to update import status after encountering an error",
			"id", id, "collection", "smartImports", "importErr", importErr, "err", err)
		return
	}
}

func ErrorFieldValueFromError(err error) string {
	return fmt.Sprintf("{\"error\": \"%s\"}", err.Error())
}
