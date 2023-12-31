import { For, Show, createSignal } from "solid-js";
import "./App.css";

const serverUrl = "http://127.0.0.1:8090/smartImport";

function smartImport(recipeUrl: string): Promise<Response> {
  return fetch(serverUrl, {
    method: "POST",
    body: JSON.stringify({
      url: recipeUrl,
    }),
  });
}

function App() {
  const [recipeUrl, setRecipeUrl] = createSignal("");
  const [recipe, setRecipe] = createSignal<Recipe | undefined>(undefined);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);

  return (
    <>
      <label>Recipe URL</label>
      <input
        placeholder="www.chef.com/cookie-recipe"
        onInput={(e) => setRecipeUrl(e.currentTarget.value)}
      >
        {recipeUrl()}
      </input>
      <input
        type="button"
        value={"Submit"}
        onClick={async () => {
          setIsLoading(true);
          smartImport(recipeUrl())
            .then((resp: Response) => resp.json())
            .then((json) => {
              setRecipe(json.recipes[0]);
              setIsLoading(false);
            });
        }}
      />
      <Show when={recipe() && !isLoading()}>
        <Recipe recipe={recipe()!!} />
      </Show>
      <Show
        when={isLoading()}
        fallback={<div class="progress-placeholder"></div>}
      >
        <progress></progress>
      </Show>
    </>
  );
}

function Recipe({ recipe }: { recipe: Recipe }) {
  return (
    <>
      <p>
        <b>{recipe.name}</b>
      </p>
      <br />
      <p>Ingredients</p>
      <Ingredients recipe={recipe} />
    </>
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
          {(ingredient) => (
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

export default App;
