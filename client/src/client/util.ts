import { RecordModel } from "pocketbase";
import { Recipe, SmartImport } from "../model/recipe";

export function recipeFromModel(model: RecordModel): Recipe {
  return model as unknown as Recipe;
}

export function smartImportFromModel(model: RecordModel): SmartImport {
  return model as unknown as SmartImport;
}
