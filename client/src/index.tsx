/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { SmartImport } from "src/components/smartImport/SmartImport";
import { AuthContextProvider } from "./AuthContext";
import Container from "./Container";
import { Greeting } from "./Greeting";
import { Landing } from "./Landing";
import { PocketBaseContextProvider } from "./PocketBaseContext";
import { SignIn } from "./SignIn";
import { BulkSmartImport } from "./components/smartImport/BulkSmartImport";
import { BulkSmartImportForm } from "./components/smartImport/BulkSmartImportForm";
import { SmartImportRecipe } from "./components/smartImport/SmartImportRecipe";
import "./index.css";

const root = document.getElementById("root");

render(
  () => (
    <>
      <PocketBaseContextProvider>
        <AuthContextProvider>
          <Router root={Container}>
            <Route path="/" component={Greeting} />
            <Route path="/app">
              <Route path="/" component={Landing} />
              <Route
                path="/bulkSmartImports/new"
                component={BulkSmartImportForm}
              />
              <Route path="/bulkSmartImports/:id" component={BulkSmartImport} />
              <Route
                path="/bulkSmartImports/:bulkSmartImportId/smartImports/:smartImportId/recipes/:recipeId"
                component={SmartImportRecipe}
              />
              <Route
                path="/bulkSmartImports/:bulkSmartImportId/smartImports/:smartImportId"
                component={SmartImport}
              />
            </Route>
            <Route path="/signin" component={SignIn} />
          </Router>
        </AuthContextProvider>
      </PocketBaseContextProvider>
    </>
  ),
  root!,
);
