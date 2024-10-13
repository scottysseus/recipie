import { ActionBar } from "src/components/common/ActionBar";

export function Nav() {
  return (
    <ActionBar>
      <a class="mr-6 underline" href="/">
        Recipes
      </a>
      <a class="mr-6 underline" href="/app/smartImports">
        Imports
      </a>
    </ActionBar>
  );
}
