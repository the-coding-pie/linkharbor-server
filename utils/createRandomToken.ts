// creates 'n' length char long hex string
const createRandomToken = async (length: number) => {
  return import("nanoid").then(({ nanoid }) => nanoid(length));
};

export default createRandomToken;
