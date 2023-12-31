interface Recipe {
  name: string;
  ingredients: Ingredient[];
  instructions: string[];
}

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  preparation: string;
}
