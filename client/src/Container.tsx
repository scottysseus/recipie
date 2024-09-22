import { ColorModeProvider, ColorModeScript } from "@kobalte/core";
import { RouteSectionProps } from "@solidjs/router";
import { createEffect } from "solid-js";
import { useAuthContext } from "./AuthContext";
import { Nav } from "./Nav";
import { usePocketBaseContext } from "./PocketBaseContext";

function Container(props: RouteSectionProps) {
  const pocketBase = usePocketBaseContext()!;
  const [, setAuthData] = useAuthContext()!;

  createEffect(() => {
    if (pocketBase().authStore.isValid) {
      setAuthData(pocketBase().authStore.model);
    }
  });

  return (
    <>
      <div class="p-6">
        <ColorModeScript />
        <ColorModeProvider>
          <Nav />
          {props.children}
        </ColorModeProvider>
      </div>
    </>
  );
}

export default Container;
