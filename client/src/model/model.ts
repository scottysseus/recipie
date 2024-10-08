export interface Recipe {
  id: string;
  created: string;
  name: string;
  isDraft: boolean;
  ingredients: Ingredient[];
  instructions: string;
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
  id: string;
  status: "success" | "processing" | "error";
  url: string;
  rawText: string;
  error: any;
  recipes: Recipe[];
}

export interface BulkSmartImport {
  id: string;
  imports: string[];
  status: "success" | "processing" | "error";
  created: string;
}
