package main

import (
	"log"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
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

	app.OnAdminAfterCreateRequest().Add(func(e *core.AdminCreateEvent) error {
		allowedUsersCollection, err := app.Dao().FindCollectionByNameOrId("allowedUsers")
		if err != nil {
			return err
		}

		newAllowedUserRecord := models.NewRecord(allowedUsersCollection)
		newAllowedUserRecord.Set("email", e.Admin.Email)

		return app.Dao().SaveRecord(newAllowedUserRecord)
	})

	app.OnRecordBeforeAuthWithOAuth2Request().Add(func(e *core.RecordAuthWithOAuth2Event) error {
		if e.OAuth2User.Email == "" {
			return apis.NewForbiddenError("a valid email address is required to sign up", struct {
				id string
			}{id: e.OAuth2User.Id})
		}


		var count struct{ Count int `db:"count"`}
		err := app.Dao().DB().NewQuery("SELECT COUNT(*) as count FROM allowedUsers WHERE email = {:email}").Bind(dbx.Params{"email": e.OAuth2User.Email}).One(&count)
		if err != nil {
			app.Logger().Error("err accessing the allowlist", "err", err)
			return apis.NewApiError(500, "error accessing the allowlist", nil)
		}

		if count.Count < 1 {
			return apis.NewUnauthorizedError("enrollment in this application is restricted to allowlisted users", struct{ email string }{email: e.OAuth2User.Email})
		}

		return nil
	})

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
