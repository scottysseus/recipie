package main

import (
	"bytes"
	"context"
	"log"
	"net/http"
	"os"

	"google.golang.org/adk/agent/llmagent"
	"google.golang.org/adk/cmd/launcher/adk"
	"google.golang.org/adk/cmd/launcher/full"
	"google.golang.org/adk/model/gemini"
	"google.golang.org/adk/server/restapi/services"
	"google.golang.org/adk/tool"
	"google.golang.org/adk/tool/functiontool"
	"google.golang.org/genai"

	"regexp"

	"github.com/PuerkitoBio/goquery"
	"golang.org/x/net/html"
)

const instructions = `
You are a helpful assistant that extracts recipes (mainly for home cooking) from anywhere on the web from just a URL.

IMPORTANT: Always return the recipes in the following JSON structure, or return an empty JSON object if the post contains no cooking recipes.
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
`

type fetchPageTextArgs struct {
	Url string `json:"url" jsonschema:"The URL of the web page to fetch the text from."`
}

type fetchPageTextResult struct {
	Text  string `json:"text,omitempty" jsonschema:"The text from the web page, unless an error was encountered."`
	Error string `json:"error,omitempty" jsonschema:"The error encountered while fetching the web page, if any."`
}

func fetchPageText(ctx tool.Context, args fetchPageTextArgs) fetchPageTextResult {
	text, err := scrapePage(args.Url)
	if err != nil {
		return fetchPageTextResult{Error: err.Error()}
	}
	return fetchPageTextResult{Text: text}
}

func main() {
	ctx := context.Background()

	model, err := gemini.NewModel(ctx, "gemini-2.0-flash", &genai.ClientConfig{
		Backend:  genai.BackendVertexAI,
		Project:  "recipie-408600",
		Location: "us-central1",
	})
	if err != nil {
		log.Fatalf("Failed to create model: %v", err)
	}

	fetchPageTextTool, err := functiontool.New(
		functiontool.Config{
			Name:        "fetch_page_text",
			Description: "Fetches the text from a web page given its URL.",
		},
		fetchPageText,
	)
	if err != nil {
		log.Fatal(err)
	}

	agent, err := llmagent.New(llmagent.Config{
		Name:        "recipie_agent",
		Model:       model,
		Description: "Fetches recipes from anywhere on the web.",
		Instruction: instructions,
		Tools: []tool.Tool{
			fetchPageTextTool,
		},
	})
	if err != nil {
		log.Fatalf("Failed to create agent: %v", err)
	}

	config := &adk.Config{
		AgentLoader: services.NewSingleAgentLoader(agent),
	}

	l := full.NewLauncher()
	if err = l.Execute(ctx, config, os.Args[1:]); err != nil {
		log.Fatalf("Run failed: %v\n\n%s", err, l.CommandLineSyntax())
	}
}

func scrapePage(url string) (string, error) {
	imgRegex := regexp.MustCompile("<img .*>")
	singlespaceRegex := regexp.MustCompile("[ ]{2,}")
	anySpaceRegex := regexp.MustCompile("[\\s]{2,}")

	res, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return "", err
	}

	bodySelection := doc.Find("body")

	// remove all image, script, and style tags from the DOM to ensure they don't appear in the text
	bodySelection.Find("img, script, style").Remove()

	// I don't understand how childTexts works exactly, but it returns many different pieces of the page text.
	// one of these pieces usually has the entire page text (and is the longest piece), so finding that is our best bet
	childTexts := childTexts(bodySelection, ":not(img, script, style)")
	longestLength := 0
	longestChild := ""

	for i := 0; i < len(childTexts); i++ {
		if len(childTexts[i]) > longestLength {
			longestChild = childTexts[i]
			longestLength = len(longestChild)
		}
	}

	// images can sometimes be embedded in text and the call to Remove() above doesn't remove these,
	// so we need to use a regular expression specifically to remove them.
	// cleaning up the white spacing can also help reduce the costs of the GenAI API.
	rawText := imgRegex.ReplaceAllString(longestChild, " ")
	rawText = singlespaceRegex.ReplaceAllString(rawText, " ")
	rawText = anySpaceRegex.ReplaceAllString(rawText, "\n")

	return rawText, nil
}

func childTexts(selection *goquery.Selection, childSelector string) []string {
	var res []string
	selection.Find(childSelector).Each(func(_ int, s *goquery.Selection) {
		res = append(res, " "+selectionToText(s)+" ")
	})
	return res
}

func selectionToText(s *goquery.Selection) string {
	var buf bytes.Buffer

	// Slightly optimized vs calling Each: no single selection object created
	var f func(*html.Node)
	f = func(n *html.Node) {
		if n.Type == html.TextNode {
			// Keep newlines and spaces, like jQuery
			buf.WriteString(n.Data)
			buf.WriteString("\n")
		}
		if n.FirstChild != nil {
			for c := n.FirstChild; c != nil; c = c.NextSibling {
				f(c)
			}
		}
	}
	for _, n := range s.Nodes {
		f(n)
	}

	return buf.String()
}
