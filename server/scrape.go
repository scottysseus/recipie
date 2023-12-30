package main

import (
	"bytes"
	"fmt"
	"regexp"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly"
	"golang.org/x/net/html"
)

func ScrapeRecipe(recipeUrl string, resultC chan<- string, errC chan<- error) {
	imgRegex := regexp.MustCompile("<img .*>")
	singlespaceRegex := regexp.MustCompile("[ ]{2,}")
	anySpaceRegex := regexp.MustCompile("[\\s]{2,}")

	c := colly.NewCollector()

	c.OnHTML("body", func(e *colly.HTMLElement) {
		fmt.Println("body found")
		e.DOM.Find("img, script, style").Remove()
		childTexts := childTexts(e, ":not(img, script, style)")
		longestLength := 0
		longestChild := ""

		for i := 0; i < len(childTexts); i++ {
			if len(childTexts[i]) > longestLength {
				longestChild = childTexts[i]
				longestLength = len(longestChild)
			}
		}

		text := imgRegex.ReplaceAllString(longestChild, " ")
		text = singlespaceRegex.ReplaceAllString(text, " ")
		text = anySpaceRegex.ReplaceAllString(text, "\n")
		recipe, err := ExtractRecipe(text)
		if err != nil {
			fmt.Println("error found")
			errC <- err
			return
		}
		fmt.Println("recipe found")
		resultC <- recipe
	})
	fmt.Println("visiting recipe url " + recipeUrl)
	c.Visit(recipeUrl)
}

func childTexts(h *colly.HTMLElement, goquerySelector string) []string {
	var res []string
	h.DOM.Find(goquerySelector).Each(func(_ int, s *goquery.Selection) {
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
