import { RecordModel } from "pocketbase";
import { Recipe } from "../model/recipe";

export function recipeFromModel(model: RecordModel): Recipe {
  return model as unknown as Recipe;
}
