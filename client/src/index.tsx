/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { RecipeView } from "src/components/RecipeView";
import { SmartImportView } from "src/components/list/SmartImportView";
import { SmartImportListContainer } from "src/components/views/SmartImportListContainer";
import { AuthContextProvider } from "./AuthContext";
import Container from "./Container";
import { PocketBaseContextProvider } from "./PocketBaseContext";
import { BulkSmartImportForm } from "./components/smartImport/BulkSmartImportForm";
import { Greeting } from "./components/views/Greeting";
import { RecipeListContainer } from "./components/views/RecipeListContainer";
import { SignIn } from "./components/views/SignIn";
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
