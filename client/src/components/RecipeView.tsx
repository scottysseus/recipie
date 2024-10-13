import { useParams } from "@solidjs/router";
import { Match, Switch, createEffect, createSignal } from "solid-js";
import { usePocketBaseContext } from "src/PocketBaseContext";
import { Loader } from "src/components/common/Loader";
import { NamedHr } from "src/components/common/NamedHr";
import { Recipe } from "src/components/common/Recipe";
import { recipeFromModel } from "src/lead/util";
import { Recipe as RecipeModel } from "src/model/model";

export function RecipeView() {
  const params = useParams();
  const pocketBase = usePocketBaseContext()!;

  const [isLoading, setIsLoading] = createSignal(true);
  const [recipe, setRecipe] = createSignal<RecipeModel | undefined>(undefined);

  createEffect(() => {
    if (params && params.id) {
      pocketBase()
        .collection("recipes")
        .getFirstListItem(pocketBase().filter(`id = "${params.id}"`))
        .then((model) => {
          setRecipe(recipeFromModel(model));
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
      console.log("params are missing an id", params);
    }
  });

  return (
    <>
      <NamedHr name={`Recipe ${params.id ?? "???"}`} />
      <Switch fallback={<RecipeError />}>
        <Match when={isLoading()}>
          <Loader />
        </Match>
        <Match when={recipe()}>
          <Recipe recipe={recipe()!} />
        </Match>
      </Switch>
    </>
  );
}

function RecipeError() {
  return (
    <div class="flex flex-col text-center">
      <h1 class="mb-3">Failed to load recipe</h1>
      <p>An error was encountered while trying to load this recipe</p>
    </div>
  );
}
