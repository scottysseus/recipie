import { SmartImport } from "../model/recipe";
import { RecipeGrid } from "../recipeGrid/RecipeGrid";

export function Overview({
  error,
  successes,
  failures,
}: {
  error: string;
  successes: SmartImport[];
  failures: SmartImport[];
}) {
  return (
    <>
      <p>{error ? error : "Success!"}</p>
      <RecipeGrid
        sections={{
          Succeeded: successes.map((success) => success.recipe),
          Failed: failures.map((failure) => failure.recipe),
        }}
      />
    </>
  );
}
