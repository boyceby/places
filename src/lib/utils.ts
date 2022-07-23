import { jwtVerify } from "jose";
import { Coords } from "../models/coords";

interface JWTToken {
  issuer: string;
  email: string;
  publicAddress: string;
  location: Coords;
  iat: number;
  exp: number;
  "https://hasura.io/jwt/claims": {
    "x-hasura-allowed-roles": string[];
    "x-hasura-default-role": string;
    "x-hasura-user-id": string;
  };
}

export const verifyTokenExtractInfo = async (jwtToken: string) => {
  if (!jwtToken) {
    return null;
  } else if (!process.env.JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY not set");
  } else {
    try {
      const decryptedToken = (
        await jwtVerify(
          jwtToken,
          new TextEncoder().encode(process.env.JWT_SECRET_KEY)
        )
      ).payload as unknown as JWTToken;
      return decryptedToken;
    } catch {
      return null;
    }
  }
};
