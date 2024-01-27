import { RecordModel } from "pocketbase";
import { Temporal } from "temporal-polyfill";
import { BulkSmartImport, Recipe, SmartImport } from "../model/recipe";

export function recipeFromModel(model: RecordModel): Recipe {
  return model as unknown as Recipe;
}

export function smartImportFromModel(model: RecordModel): SmartImport {
  return model as unknown as SmartImport;
}

export function bulkSmartImportFromModel(model: RecordModel): BulkSmartImport {
  return model as unknown as BulkSmartImport;
}

export function toLocalizedDateTimeString(datetime: string) {
  return Temporal.Instant.from(datetime)
    .toZonedDateTimeISO(Intl.DateTimeFormat().resolvedOptions().timeZone)
    .toLocaleString(navigator.language);
}
