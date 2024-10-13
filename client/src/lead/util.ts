import { RecordModel } from "pocketbase";
import { Temporal } from "temporal-polyfill";
import { Recipe, SmartImport } from "../model/model";

export function recipeFromModel(model: RecordModel): Recipe {
  return {
    id: model.id,
    name: model.name,
    created: model.created,
    isDraft: model.isDraft,
    prepTimeMinutes: model.prepTimeMinutes,
    totalTimeMinutes: model.totalTimeMinutes,
    ingredients: model.ingredients.ingredients,
    instructions: model.instructions.instructions,
  };
}

export function smartImportFromModel(model: RecordModel): SmartImport {
  return model as unknown as SmartImport;
}

export function toLocalizedDateTimeString(datetime: string) {
  return Temporal.Instant.from(datetime)
    .toZonedDateTimeISO(Intl.DateTimeFormat().resolvedOptions().timeZone)
    .toLocaleString(navigator.language);
}
