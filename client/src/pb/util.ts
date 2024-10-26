import { Setter } from "solid-js";

export const arrayUpdateSubscriptionCallback = <
  T extends { id: string; created: string },
>(
  newItem: T,
  action: string,
  signalSetter: Setter<T[]>,
) => {
  signalSetter((prev) => {
    let index = NaN;
    let newArray = [...prev];
    switch (action) {
      case "create":
        newArray = [
          newItem,
          ...prev.filter((recipe) => recipe.id !== newItem.id),
        ];
        break;
      case "update":
        index = prev.findIndex((recipe) => {
          return recipe.id === newItem.id;
        });
        if (index) {
          newArray = [...prev.filter((recipe) => recipe.id !== newItem.id)];
          newArray.splice(index, 1, newItem);
        } else {
          [newItem, ...prev.filter((recipe) => recipe.id !== newItem.id)];
        }
        break;
      case "delete":
        newArray = prev.filter((item) => item.id !== newItem.id);
        break;
    }
    newArray.sort((a, b) => {
      return new Date(a.created).getTime() - new Date(b.created).getTime();
    });
    return newArray;
  });
};

export const getDefaultUnsubscribeFunc = () => {
  return Promise.resolve(() => Promise.resolve());
};
