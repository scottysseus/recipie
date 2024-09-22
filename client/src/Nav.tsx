import { Show } from "solid-js";
import { ModeToggle } from "src/components/ui/mode-toggle";
import { useAuthContext } from "./AuthContext";

export function Nav() {
  const [authData, , signOut] = useAuthContext()!;
  return (
    <div class="flex flex-col text-end">
      <div class="flex justify-end align-baseline">
        <p
          class="text-xs"
          style={{ visibility: authData() ? "inherit" : "hidden" }}
        >
          signed in as: {authData()?.email || "unknown"}
        </p>
        <ModeToggle />
      </div>
      <nav class="mb-6 flex flex-wrap items-baseline justify-between">
        <div class="mr-6 flex flex-shrink-0 items-center">
          <a class="text-xl font-semibold tracking-tight" href="/">
            Recipie
          </a>
        </div>
        <Show
          when={authData()}
          fallback={
            <a class="hover:underline" href="/signin">
              Sign in
            </a>
          }
        >
          <button
            class="hover:underline"
            onClick={() => {
              signOut();
              window.location.href = "/";
            }}
          >
            Sign out
          </button>
        </Show>
      </nav>
    </div>
  );
}
