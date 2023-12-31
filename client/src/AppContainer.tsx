import { useLocation } from "@solidjs/router";
import { ParentProps, Show } from "solid-js";

export function AppContainer(props: ParentProps) {
  const location = useLocation();
  return (
    <>
      <div class="mb-16 flex justify-start">
        <Show
          when={location.pathname === "/app"}
          fallback={
            <a class="hover:underline" href="/app">
              Cancel
            </a>
          }
        >
          <a class="hover:underline" href="/app/smartImport">
            + New Recipe
          </a>
        </Show>
      </div>
      {props.children}
    </>
  );
}
