package main

import (
	"bytes"
	"net/http"
	"regexp"

	"github.com/PuerkitoBio/goquery"
	"golang.org/x/net/html"
)

func ScrapeRecipe(recipeUrl string) (string, error) {
	imgRegex := regexp.MustCompile("<img .*>")
	singlespaceRegex := regexp.MustCompile("[ ]{2,}")
	anySpaceRegex := regexp.MustCompile("[\\s]{2,}")

	res, err := http.Get(recipeUrl)
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
	rawRecipeText := imgRegex.ReplaceAllString(longestChild, " ")
	rawRecipeText = singlespaceRegex.ReplaceAllString(rawRecipeText, " ")
	rawRecipeText = anySpaceRegex.ReplaceAllString(rawRecipeText, "\n")

	return rawRecipeText, nil
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
