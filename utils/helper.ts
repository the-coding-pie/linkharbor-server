// creates 'n' length char long hex string
export const createRandomToken = (length: number) => {
  return import("nanoid").then(({ nanoid }) => nanoid(length));
};
