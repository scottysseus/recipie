import { useNavigate } from "@solidjs/router";
import PocketBase from "pocketbase";
import { createSignal } from "solid-js";
import { ActionBar } from "src/components/common/ActionBar";
import { usePocketBaseContext } from "src/PocketBaseContext";

export function BulkSmartImportForm() {
  const navigate = useNavigate();
  const [recipeUrls, setRecipeUrls] = createSignal<string[]>([]);
  const pocketBase = usePocketBaseContext()!;

  return (
    <>
      <ActionBar>
        <a class="hover:underline" href="/app">
          Cancel
        </a>
      </ActionBar>
      <div class="flex flex-col">
        <label>Enter one recipe URL per line:</label>
        <textarea
          class="left-0 right-0 mb-3 ml-auto mr-auto block h-32 min-w-full border-2 border-black p-1"
          placeholder="www.chef.com/cookie-recipe&#10;www.chef.com/pie-recipe.html&#10;www.cooking.org/tendy-recipe&#10;www.cooking.com/pizza-recipe.aspx"
          onInput={(e) => setRecipeUrls(e.currentTarget.value.split("\n"))}
        >
          {recipeUrls().join("\n")}
        </textarea>
        <button
          class="hover:underline"
          onClick={async () => {
            smartImport(pocketBase(), recipeUrls())
              // TODO handle errors here
              .catch((error) => {
                console.log(error);
              })
              .finally(() => {
                navigate(`/app/smartImports`);
              });
          }}
        >
          Import
        </button>
      </div>
    </>
  );
}

function smartImport(
  pocketBase: PocketBase | undefined,
  recipeUrls: string[],
): Promise<any> {
  if (!pocketBase) {
    return Promise.resolve();
  }
  return Promise.all(
    recipeUrls.map((url) =>
      pocketBase.collection("smartImports").create({
        url,
      }),
    ),
  );
}
