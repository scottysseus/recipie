package main

type VertexResponse struct {
	Recipes []VertexRecipe `json:"recipes"`
}

type VertexRecipe struct {
	Name             string             `json:"name"`
	Ingredients      []VertexIngredient `json:"ingredients"`
	Instructions     []string           `json:"instructions"`
	PrepTimeMinutes  int                `json:"prepTimeMinutes"`
	TotalTimeMinutes int                `json:"totalTimeMinutes"`
}

type VertexIngredient struct {
	Name        string `json:"name"`
	Quantity    string `json:"quantity"`
	Unit        string `json:"unit"`
	Preparation string `json:"preparation"`
}
