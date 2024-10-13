package main

type SmartImportRequest struct {
	Items []SmartImportItem `json:"items"`
}

type SmartImportItem struct {
	Url string `json:"url"`
}

type SmartImportResponse struct {
	UrlImports []UrlImport `json:"urlImports"`
}

type UrlImport struct {
	Url string `json:"url"`
	Id  string `json:"id"`
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
