import { Setter } from "solid-js";

export const arrayUpdateSubscriptionCallback = <T extends { id: string }>(
  newItem: T,
  action: string,
  signalSetter: Setter<T[]>,
) => {
  signalSetter((prev) => {
    let index = NaN;
    switch (action) {
      case "create":
        return [newItem, ...prev.filter((recipe) => recipe.id !== newItem.id)];
      case "update":
        index = prev.findIndex((recipe) => {
          return recipe.id === newItem.id;
        });
        if (index) {
          const newArray = [
            ...prev.filter((recipe) => recipe.id !== newItem.id),
          ];
          newArray.splice(index, 1, newItem);
          return newArray;
        }
        return [newItem, ...prev.filter((recipe) => recipe.id !== newItem.id)];

      case "delete":
        return prev.filter((item) => item.id !== newItem.id);
    }
    return [...prev];
  });
};

export const getDefaultUnsubscribeFunc = () => {
  return Promise.resolve(() => Promise.resolve());
};
