import { db } from "../db";
import { generateUsername } from "unique-username-generator";

// const filteredAdjectives = adjectives.filter(
//   (a) => !a.includes("sex") || !a.includes("hot")
// );

const genUsername = async () => {
  let usernameExists = true;

  let username = "";

  while (usernameExists) {
    username = generateUsername("_", 4, 30).toLowerCase();

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
