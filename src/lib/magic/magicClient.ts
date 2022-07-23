import { Magic } from "magic-sdk";

const instantiateMagicClient = () => {
  if (typeof window !== "undefined") {
    if (!process.env.MAGIC_PUBLISHABLE_API_KEY) {
      throw new Error("MAGIC_PUBLISHABLE_API_KEY is not set");
    }
    return new Magic(process.env.MAGIC_PUBLISHABLE_API_KEY);
  } else {
    return null;
  }
};

export const magic = instantiateMagicClient();
