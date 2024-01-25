/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { AuthContextProvider } from "./AuthContext";
import Container from "./Container";
import { Greeting } from "./Greeting";
import { Landing } from "./Landing";
import { PocketBaseContextProvider } from "./PocketBaseContext";
import { SignIn } from "./SignIn";
import "./index.css";
import { BulkSmartImport } from "./smartImport/BulkSmartImport";
import { BulkSmartImportForm } from "./smartImport/BulkSmartImportForm";

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
            </Route>
            <Route path="/signin" component={SignIn} />
          </Router>
        </AuthContextProvider>
      </PocketBaseContextProvider>
    </>
  ),
  root!,
);
