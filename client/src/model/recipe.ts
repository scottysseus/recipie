export interface Recipe {
  name: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTimeMinutes: number;
  totalTimeMinutes: number;
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  preparation: string;
}

export interface SmartImport {
  status: "success" | "processing" | "error";
  url: string;
  rawText: string;
  error: any;
  recipe: Recipe;
}
