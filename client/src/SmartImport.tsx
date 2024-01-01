import PocketBase from "pocketbase";
import { For, Show, createSignal } from "solid-js";
import { usePocketBaseContext } from "./PocketBaseContext";
import { Ingredient, Recipe } from "./recipe";

const serverUrl = "/smartImport";

function smartImport(
  pocketBase: PocketBase | undefined,
  recipeUrl: string,
): Promise<Response> {
  if (!pocketBase) {
    return Promise.resolve(new Response());
  }
  return pocketBase.send(serverUrl, {
    method: "POST",
    body: JSON.stringify({
      url: recipeUrl,
    }),
  });
}

export function SmartImport() {
  const [recipeUrl, setRecipeUrl] = createSignal("");
  const [recipe, setRecipe] = createSignal<Recipe | undefined>(undefined);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const pocketBase = usePocketBaseContext()!;

  return (
    <div>
      <div class="m-12 flex justify-center align-text-bottom">
        <input
          class="me-2 w-96 border-2 border-black p-1"
          placeholder="www.chef.com/cookie-recipe"
          onInput={(e) => setRecipeUrl(e.currentTarget.value)}
        >
          {recipeUrl()}
        </input>
        <button
          class="hover:underline"
          onClick={async () => {
            setIsLoading(true);
            smartImport(pocketBase(), recipeUrl())
              .then((resp: Response) => resp.json())
              .then((json) => {
                setRecipe(json.recipes[0]);
                setIsLoading(false);
              });
          }}
        >
          Import
        </button>
      </div>
      <Show when={recipe() && !isLoading()}>
        <RecipeSection recipe={recipe()!!} />
      </Show>
      <Show
        when={isLoading()}
        fallback={<div class="progress-placeholder"></div>}
      >
        <progress></progress>
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
