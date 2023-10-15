import { CategoryObj } from "../types/interfaces";

function categorizeByAlphabet(categories: CategoryObj[]) {
  const categorizedCategories: Record<string, CategoryObj[]> = {};

  for (const category of categories) {
    const firstLetter = category.name[0].toUpperCase(); // Get the first letter and convert to uppercase

    if (!categorizedCategories[firstLetter]) {
      categorizedCategories[firstLetter] = [];
    }

    categorizedCategories[firstLetter].push(category);
  }

  return categorizedCategories;
}

export default categorizeByAlphabet;
