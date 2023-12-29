package main

import (
	"context"
	"encoding/json"
	"fmt"

	"cloud.google.com/go/vertexai/genai"
)

var projectId = "recipie-408600"
var region = "us-central1"

const prompt = `
I will provide you with a long-form cooking recipe blog post. 
For each recipe in the post, please extract the instructions and the list of ingredients. 
For each ingredient, extract its name, its quantity, the unit for its quantity, and any preparation (e.g. "chopped").

Please respond with a JSON object. Return an empty JSON object if the post contains no cooking recipes.

For example:

{
    "recipes": [
        {
            "name: "recipe1",
            "ingredients": [
                {
                    "name": "onion",
                    "quantity": "2",
                    "unit": "cups",
                    "preparation": "chopped"
                }
            ],
            "instructions": [
                "do something",
                "do something else"
            ]
        }
    ]
}

Below is the recipe:
`

func ExtractRecipe(rawText string) error {
	client, err := genai.NewClient(context.Background(), projectId, region)
	if err != nil {
		return err
	}
	gemini := client.GenerativeModel("gemini-pro")

	prompt := genai.Text(prompt)
	rawPart := genai.Text(rawText)
	resp, err := gemini.GenerateContent(context.Background(), prompt, rawPart)
	if err != nil {
		return fmt.Errorf("error generating content: %w", err)
	}
	rb, _ := json.MarshalIndent(resp, "", "  ")
	fmt.Println(string(rb))
	return nil
}
