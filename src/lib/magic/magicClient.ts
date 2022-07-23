import { Magic } from "magic-sdk";

const instantiateMagicClient = () => {
  if (typeof window !== "undefined") {
    if (!process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_API_KEY) {
      throw new Error("NEXT_PUBLIC_MAGIC_PUBLISHABLE_API_KEY is not set");
    }
    return new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_API_KEY);
  } else {
    return null;
  }
};

export const magic = instantiateMagicClient();
