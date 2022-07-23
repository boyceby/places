import { Magic } from "@magic-sdk/admin";

const instantiateMagicServer = () => {
  if (!process.env.MAGIC_SECRET_API_KEY) {
    throw new Error("MAGIC_SECRET_API_KEY is not set");
  }
  return new Magic(process.env.MAGIC_SECRET_API_KEY);
};

export const magic = instantiateMagicServer();
