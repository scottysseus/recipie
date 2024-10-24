package main

import (
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	_ "github.com/scottysseus/recipie/migrations"
)

// https://theinspiredhome.com/articles/authentic-street-tacos-for-tacotuesday/
// https://www.pillsbury.com/recipes/classic-chicken-pot-pie/1401d418-ac0b-4b50-ad09-c6f1243fb992
// https://www.savethestudent.org/save-money/food-drink/6-delicious-recipes-you-can-make-with-baked-beans.html
// https://www.sweetestmenu.com/dark-chocolate-almond-fudge/

func main() {
	app := pocketbase.New()
	
	worker := NewSmartImportWorker(app)

	app.OnModelAfterCreate("smartImports").Add(func(e *core.ModelEvent) error {

		go func() {
			err := worker.SmartImport(e)
			if err != nil {
				app.Logger().Error("error processing smart import creation event", "err", err, "id", e.Model.GetId())
			}
		}()

		return nil
	})

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{})

	if err := app.Start(); err != nil {
		log.Println("failed to start")
		log.Fatal(err)
	}
}
