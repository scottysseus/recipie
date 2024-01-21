/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { AppContainer } from "./AppContainer";
import { AuthContextProvider } from "./AuthContext";
import Container from "./Container";
import { Greeting } from "./Greeting";
import { Landing } from "./Landing";
import { PocketBaseContextProvider } from "./PocketBaseContext";
import { SignIn } from "./SignIn";
import "./index.css";
import { SmartImport } from "./smartImport/SmartImport";

const root = document.getElementById("root");

render(
  () => (
    <>
      <PocketBaseContextProvider>
        <AuthContextProvider>
          <Router root={Container}>
            <Route path="/" component={Greeting} />
            <Route path="/app" component={AppContainer}>
              <Route path="/" component={Landing} />
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
