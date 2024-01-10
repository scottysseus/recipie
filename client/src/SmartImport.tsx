import PocketBase from "pocketbase";
import { For, Show, createSignal } from "solid-js";
import { Loader } from "./Loader";
import { usePocketBaseContext } from "./PocketBaseContext";
import { Ingredient, Recipe } from "./recipe";

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
  const [recipeUrls, setRecipeUrls] = createSignal<string[]>([]);
  const [recipe, setRecipe] = createSignal<Recipe | undefined>(undefined);
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
              setRecipe(json.recipes[0]);
            })
            .finally(() => {
              setIsLoading(false);
            });
        }}
      >
        Import
      </button>
      <Show when={recipe() && !isLoading()}>
        <RecipeSection recipe={recipe()!!} />
      </Show>
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

function RecipeSection({ recipe }: { recipe: Recipe }) {
  return (
    <div>
      <p>
        <b>{recipe.name}</b>
      </p>
      <br />
      <p>Ingredients</p>
      <Ingredients recipe={recipe} />
    </div>
  );
}

function Ingredients({ recipe }: { recipe: Recipe }) {
  return (
    <table>
      <tbody>
        <tr>
          <th>Name</th>
          <th>Quantity</th>
          <th>Unit</th>
          <th>Preparation</th>
        </tr>
        <For each={recipe.ingredients}>
          {(ingredient: Ingredient) => (
            <tr>
              <td>{ingredient.name}</td>
              <td>{ingredient.quantity}</td>
              <td>{ingredient.unit}</td>
              <td>{ingredient.preparation}</td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}
