import {
  adjectives,
  names,
  starWars,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";
import { db } from "../db";

// const filteredAdjectives = adjectives.filter(
//   (a) => !a.includes("sex") || !a.includes("hot")
// );

const genUsername = async () => {
  let usernameExists = true;

  let username = "";

  while (usernameExists) {
    username = uniqueNamesGenerator({
      dictionaries: [names, starWars, colors],
      separator: "_",
      length: 2,
      style: "lowerCase",
    });

    const userExists = await db.query.userTable.findFirst({
      where: (user, { eq }) => eq(user.username, username),
    });

    if (!userExists) {
      usernameExists = false;
    }
  }

  return username;
};

export default genUsername;
