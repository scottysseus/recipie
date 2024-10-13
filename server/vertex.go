package main

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"

	"cloud.google.com/go/vertexai/genai"
)

var projectId = "recipie-408600"
var region = "us-central1"

const prompt = `
I will provide you with a long-form cooking recipe blog post. 
For each recipe in the post, please extract:
- the instructions
- the list of ingredients
- and the prep time and total cooking time in minutes

For each ingredient, please extract:
- its name 
- its quantity, 
- the unit for its quantity (in singular form)
- any preparation (e.g. "chopped")

Please respond with a JSON object. Return an empty JSON object if the post contains no cooking recipes.

For example:
{
    "recipes": [
        {
            "name: "recipe1",
            "ingredients": [
                {
                    "name": "onion",
                    "quantity": "2.5",
                    "unit": "cup",
                    "preparation": "chopped"
                }
            ],
            "instructions": [
                "do something",
                "do something else"
            ],
			"prepTimeMinutes": 15,
			"totalTimeMinutes": 55
        }
    ]
}

Below is the recipe:
`

func ExtractRecipe(rawText string) (VertexResponse, error) {
	codeBlockStartRegex := regexp.MustCompile(`^[\s\S]*\n{`)
	codeBlockEndRegex := regexp.MustCompile(`}[^}]*$`)

	client, err := genai.NewClient(context.Background(), projectId, region)
	if err != nil {
		return VertexResponse{}, err
	}
	gemini := client.GenerativeModel("gemini-pro")
	temperature := float32(0)
	topP := float32(1)
	topK := int32(1)
	maxOutputTokens := int32(2048)
	gemini.ResponseMIMEType = "application/json"
	gemini.GenerationConfig = genai.GenerationConfig{Temperature: &temperature, TopP: &topP, TopK: &topK, MaxOutputTokens: &maxOutputTokens}

	prompt := genai.Text(prompt)
	rawPart := genai.Text(rawText)
	resp, err := gemini.GenerateContent(context.Background(), prompt, rawPart)

	if err != nil {
		return VertexResponse{}, fmt.Errorf("error generating content: %w", err)
	}

	var allParts string
	for i := 0; i < len(resp.Candidates); i++ {
		if resp.Candidates[i].Content == nil {
			continue
		}
		for j := 0; j < len(resp.Candidates[i].Content.Parts); j++ {
			switch text := resp.Candidates[i].Content.Parts[j].(type) {
			case genai.Text:
				allParts += string(text)
			}

		}
	}

	allParts = codeBlockStartRegex.ReplaceAllLiteralString(allParts, "{")
	allParts = codeBlockEndRegex.ReplaceAllLiteralString(allParts, "}")

	var vertexResponse VertexResponse
	err = json.Unmarshal([]byte(allParts), &vertexResponse)
	if err != nil {
		return VertexResponse{}, err
	}

	return vertexResponse, nil
}
