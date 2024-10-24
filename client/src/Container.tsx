import { RouteSectionProps } from "@solidjs/router";
import { createEffect } from "solid-js";
import { Nav } from "src/Nav";
import { useAuthContext } from "./AuthContext";
import { Header } from "./Header";
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
      <div class="p-6 font-mono">
        <Header />
        <Nav />
        {props.children}
      </div>
    </>
  );
}

export default Container;
