export interface Recipe {
  name: string;
  ingredients: Ingredient[];
  instructions: string[];
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  preparation: string;
}
