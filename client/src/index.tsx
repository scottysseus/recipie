/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { AppContainer } from "./AppContainer";
import { AuthContextProvider } from "./AuthContext";
import Container from "./Container";
import { Landing } from "./Landing";
import { PocketBaseContextProvider } from "./PocketBaseContext";
import { RecipeGrid } from "./RecipeGrid";
import { SignIn } from "./SignIn";
import { SmartImport } from "./SmartImport";
import "./index.css";

const root = document.getElementById("root");

render(
  () => (
    <>
      <PocketBaseContextProvider>
        <AuthContextProvider>
          <Router root={Container}>
            <Route path="/" component={Landing} />
            <Route path="/app" component={AppContainer}>
              <Route path="/" component={RecipeGrid} />
              <Route path="/smartImport" component={SmartImport} />
            </Route>
            <Route path="/signin" component={SignIn} />
          </Router>
        </AuthContextProvider>
      </PocketBaseContextProvider>
    </>
  ),
  root!,
);
