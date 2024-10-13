/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { RecipeView } from "src/components/RecipeView";
import { AuthContextProvider } from "./AuthContext";
import Container from "./Container";
import { Greeting } from "./Greeting";
import { Landing } from "./Landing";
import { PocketBaseContextProvider } from "./PocketBaseContext";
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
              <Route path="/" component={Landing} />
              <Route path="/smartImports/new" component={BulkSmartImportForm} />
              <Route path="/recipes/:id" component={RecipeView} />
            </Route>
            <Route path="/signin" component={SignIn} />
          </Router>
        </AuthContextProvider>
      </PocketBaseContextProvider>
    </>
  ),
  root!,
);
