import PocketBase from "pocketbase";
import { Show, createSignal } from "solid-js";
import { Loader } from "./Loader";
import { usePocketBaseContext } from "./PocketBaseContext";
import { Recipe } from "./recipe";

function smartImport(
  pocketBase: PocketBase | undefined,
  recipeUrls: string[],
): Promise<Response> {
  if (!pocketBase) {
    return Promise.resolve(new Response());
  }
  return pocketBase.send("/smartImport", {
    method: "POST",
    body: JSON.stringify({
      items: recipeUrls.map((url) => ({
        url,
      })),
    }),
  });
}

export function SmartImport() {
  const manager = new SmartImportManager();
  return <RecipeEntry setBulkImportId={(id) => (manager.bulkImportId = id)} />;
}

enum SmartImportState {
  RECIPE_ENTRY,
  LOADING,
  RECOVERING,
  OVERVIEW,
  EDIT_RECIPE,
  CONFIRM,
}

class SmartImportManager {
  bulkImportId = "";
  isLoading = false;
  recipes: Recipe[] = [];

  getState() {
    if (!this.bulkImportId) {
      return SmartImportState.RECIPE_ENTRY;
    }

    if (this.isLoading) {
      return SmartImportState.LOADING;
    }
  }
}

function RecipeEntry({
  setBulkImportId,
}: {
  setBulkImportId: (id: string) => void;
}) {
  const [recipeUrls, setRecipeUrls] = createSignal<string[]>([]);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const pocketBase = usePocketBaseContext()!;

  return (
    <div class="flex flex-col pl-24 pr-24">
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
          setIsLoading(true);
          smartImport(pocketBase(), recipeUrls())
            .then((resp: Response) => resp.json())
            .then((json) => {
              setBulkImportId(json.id);
            })
            // TODO handle errors here
            .catch(() => {})
            .finally(() => {
              setIsLoading(false);
            });
        }}
      >
        Import
      </button>
      <Show
        when={isLoading()}
        fallback={<div class="progress-placeholder"></div>}
      >
        <div class="text-center">
          <Loader />
        </div>
      </Show>
    </div>
  );
}
