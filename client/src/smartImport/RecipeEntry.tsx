import PocketBase from "pocketbase";
import { createSignal } from "solid-js";
import { usePocketBaseContext } from "../PocketBaseContext";

export function RecipeEntry({
  setBulkImportId,
}: {
  setBulkImportId: (id: string) => void;
}) {
  const [recipeUrls, setRecipeUrls] = createSignal<string[]>([]);
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
          smartImport(pocketBase(), recipeUrls())
            .then((json: { id: string }) => {
              setBulkImportId(json.id);
            })
            // TODO handle errors here
            .catch((error) => {
              console.log(error);
            });
        }}
      >
        Import
      </button>
    </div>
  );
}

function smartImport(
  pocketBase: PocketBase | undefined,
  recipeUrls: string[],
): Promise<{ id: string }> {
  if (!pocketBase) {
    return Promise.resolve({ id: "" });
  }
  return pocketBase.send("/smartImport", {
    method: "POST",
    body: JSON.stringify({
      items: recipeUrls.map((url) => ({
        url: url.trim(),
      })),
    }),
  });
}
