import {
  adjectives,
  names,
  starWars,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";

const genUsername = () => {
  const username = uniqueNamesGenerator({
    dictionaries: [adjectives, names, starWars, colors],
    separator: "_",
    length: 2,
    style: "lowerCase",
  });

  return username;
};

export default genUsername;
