import { useState } from "react";
import "./App.css";
import { Ingredient, Recipe } from "./recipe";

const serverUrl = "http://127.0.0.1:8090/smartImport";

function smartImport(recipeUrl: string): Promise<Response> {
  return fetch(serverUrl, {
    method: "POST",
    body: JSON.stringify({
      url: recipeUrl,
    }),
  });
}

function RecipeSection({ recipe }: { recipe: Recipe }) {
  return (
    <>
      <p>
        <b>{recipe.name}</b>
      </p>
      <br />
      <p>Ingredients</p>
      <IngredientsTable recipe={recipe} />
    </>
  );
}

function IngredientsTable({ recipe }: { recipe: Recipe }) {
  return (
    <table>
      <tbody>
        <tr>
          <th>Name</th>
          <th>Quantity</th>
          <th>Unit</th>
          <th>Preparation</th>
        </tr>
        {recipe.ingredients.map((ingredient) => IngredientRow({ ingredient }))}
      </tbody>
    </table>
  );
}

function IngredientRow({ ingredient }: { ingredient: Ingredient }) {
  return (
    <tr>
      <td>{ingredient.name}</td>
      <td>{ingredient.quantity}</td>
      <td>{ingredient.unit}</td>
      <td>{ingredient.preparation}</td>
    </tr>
  );
}

function App() {
  const [recipeUrl, setRecipeUrl] = useState("");
  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <>
      <label>Recipe URL</label>
      <input
        placeholder="www.chef.com/cookie-recipe"
        onInput={(e) => setRecipeUrl(e.currentTarget.value)}
        value={recipeUrl}
      />
      <input
        type="button"
        value={"Submit"}
        onClick={async () => {
          setIsLoading(true);
          smartImport(recipeUrl)
            .then((resp: Response) => resp.json())
            .then((json) => {
              setRecipe(json.recipes[0]);
              setIsLoading(false);
            });
        }}
      />
      {recipe && !isLoading && <RecipeSection recipe={recipe} />}
      {isLoading && <progress></progress>}
      {!isLoading && !recipe && <div className="progress-placeholder"></div>}
    </>
  );
}

export default App;
