import { SmartImport } from "../model/recipe";
import { RecipeGrid } from "../recipeGrid/RecipeGrid";

export function Overview({ smartImports }: { smartImports: SmartImport[] }) {
  return (
    <>
      <RecipeGrid
        sections={{
          Succeeded: smartImports
            .filter((smartImport) => smartImport.status === "success")
            .map((smartImport) => smartImport.recipes)
            .reduce(function (elem1, elem2) {
              return elem1.concat(elem2);
            }),
        }}
      />
    </>
  );
}
