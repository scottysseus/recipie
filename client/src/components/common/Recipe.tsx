import { For, Match, Show, Switch, createSignal } from "solid-js";
import { toLocalizedDateTimeString } from "../../lead/util";
import { Ingredient, Recipe as RecipeRecord } from "../../model/model";

enum Mode {
  EDIT,
  VIEW,
}

export function Recipe(props: { recipe: RecipeRecord }) {
  const [mode, setMode] = createSignal(Mode.VIEW);
  return (
    <>
      <div class="mb-4">
        <Switch
          fallback={
            <ViewModeButtons
              recipe={props.recipe}
              onEditClicked={() => setMode(Mode.EDIT)}
            />
          }
        >
          <Match when={mode() === Mode.VIEW}>
            <ViewModeButtons
              recipe={props.recipe}
              onEditClicked={() => setMode(Mode.EDIT)}
            />
          </Match>
          <Match when={mode() === Mode.EDIT}>
            <EditModeButtons onCancelClicked={() => setMode(Mode.VIEW)} />
          </Match>
        </Switch>
      </div>
      <h1 class="mr-3 inline text-xl">{props.recipe.name}</h1>
      <p class="inline italic text-gray-600 underline">
        {props.recipe.isDraft ? "Draft" : ""}
      </p>
      <p class="text-gray-600">
        From {toLocalizedDateTimeString(props.recipe.created)}
      </p>
      <h2 class="mb-6 mt-6">Ingredients</h2>
      <ul class="list-disc">
        <For each={props.recipe.ingredients}>
          {(ingredient: Ingredient) => (
            <li class="ml-6 text-sm">
              {ingredient.name}, {ingredient.quantity} {ingredient.unit}
            </li>
          )}
        </For>
      </ul>
      <h2 class="mb-6 mt-6">Instructions</h2>
      <ol class="list-decimal">
        <For each={props.recipe.instructions}>
          {(instruction: string) => <li class="ml-6 text-sm">{instruction}</li>}
        </For>
      </ol>
    </>
  );
}

const ViewModeButtons = (props: {
  recipe: RecipeRecord;
  onEditClicked: () => void;
}) => {
  return (
    <>
      <button class="mr-4 hover:underline" onClick={props.onEditClicked}>
        Edit {props.recipe.isDraft ? "draft" : "draft"}
      </button>
      <Show when={props.recipe.isDraft}>
        <button class="mr-4 hover:underline">Keep draft</button>
      </Show>
    </>
  );
};

const EditModeButtons = (props: { onCancelClicked: () => void }) => {
  return (
    <>
      <button class="mr-4 hover:underline">Save</button>
      <button class="mr-4 hover:underline" onClick={props.onCancelClicked}>
        Cancel
      </button>
    </>
  );
};
