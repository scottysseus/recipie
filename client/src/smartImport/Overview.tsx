import { SmartImport } from "../model/recipe";
import { RecipeGrid } from "../recipeGrid/RecipeGrid";

export function Overview({ smartImports }: { smartImports: SmartImport[] }) {
  return (
    <>
      <RecipeGrid
        sections={{
          Succeeded: smartImports
            .filter((smartImport) => smartImport.status === "success")
            .map((smartImport) => smartImport.recipe),
        }}
      />
    </>
  );
}
