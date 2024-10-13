/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { SmartImportListContainer } from "src/SmartImportListContainer";
import { RecipeView } from "src/components/RecipeView";
import { SmartImportView } from "src/components/list/SmartImportView";
import { AuthContextProvider } from "./AuthContext";
import Container from "./Container";
import { Greeting } from "./Greeting";
import { PocketBaseContextProvider } from "./PocketBaseContext";
import { RecipeListContainer } from "./RecipeListContainer";
import { SignIn } from "./SignIn";
import { BulkSmartImportForm } from "./components/smartImport/BulkSmartImportForm";
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
              <Route path="/" component={RecipeListContainer} />
              <Route path="/recipes" component={RecipeListContainer} />
              <Route path="/recipes/:id" component={RecipeView} />
              <Route
                path="/smartImports"
                component={SmartImportListContainer}
              />
              <Route path="/smartImports/:id" component={SmartImportView} />
              <Route path="/smartImports/new" component={BulkSmartImportForm} />
            </Route>
            <Route path="/signin" component={SignIn} />
          </Router>
        </AuthContextProvider>
      </PocketBaseContextProvider>
    </>
  ),
  root!,
);
