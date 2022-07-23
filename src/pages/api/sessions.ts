import type { NextApiRequest, NextApiResponse } from "next";
import { magic } from "../../lib/magic/magicServer";
import { SignJWT } from "jose";
import { createNewUser, getIsNewUser } from "../../lib/db/hasura";
import { removeTokenCookie, setTokenCookie } from "../../lib/cookies";
import { verifyTokenExtractInfo } from "../../lib/utils";
import { Coords, isCoords } from "../../models/coords";

export const TOKEN_MAX_AGE = 30 * 60; // 30 minutes (in seconds)

export type SessionsRespData = {
  done: boolean;
  location?: Coords;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<SessionsRespData>
) => {
  try {
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY not set");
    }

    if (req.method === "POST") {
      const auth = req.headers.authorization;
      const didToken = auth ? auth.substring(7) : "";
      const didTokenMetadata = await magic.users.getMetadataByToken(didToken);

      if (
        !didTokenMetadata.issuer ||
        !didTokenMetadata.email ||
        !didTokenMetadata.publicAddress
      ) {
        throw new Error("Incomplete metadata extracted from didToken");
      }

      const location = req.body?.location;

      if (!isCoords(location)) {
        res.status(400).send({ done: false });
      } else {
        const currentTime = Math.floor(Date.now() / 1000);

        const jwtToken = await new SignJWT({
          ...didTokenMetadata,
          location,
          iat: currentTime,
          exp: currentTime + TOKEN_MAX_AGE,
          "https://hasura.io/jwt/claims": {
            "x-hasura-allowed-roles": ["user", "admin"],
            "x-hasura-default-role": "user",
            "x-hasura-user-id": `${didTokenMetadata.issuer}`,
          },
        })
          .setProtectedHeader({ alg: "HS256" })
          .sign(new TextEncoder().encode(process.env.JWT_SECRET_KEY));

        const isNewUser = await getIsNewUser(jwtToken, didTokenMetadata.issuer);
        isNewUser && (await createNewUser(jwtToken, didTokenMetadata));
        setTokenCookie(jwtToken, res);

        res.status(200).send({ done: true });
      }
    } else if (req.method === "DELETE") {
      const token = req.cookies.token;
      const verifiedToken = await verifyTokenExtractInfo(token);

      if (!verifiedToken) {
        res.status(401).send({ done: false });
      } else {
        const { issuer: userIssuer } = verifiedToken;
        removeTokenCookie(res);
        try {
          await magic.users.logoutByIssuer(userIssuer);
        } catch {
          console.error("Error logging user out by Magic issuer");
        }
        res.writeHead(302, { Location: "/signin" });
        res.end();
      }
    } else if (req.method === "GET") {
      const token = req.cookies.token;
      const verifiedToken = await verifyTokenExtractInfo(token);
      if (verifiedToken && verifiedToken.exp > Date.now() / 1000) {
        res.status(200).send({ done: true, location: verifiedToken.location });
      } else {
        res.status(401).send({ done: false });
      }
    } else {
      res
        .status(405)
        .setHeader("Allow", JSON.stringify(["POST", "DELETE", "GET"]))
        .send({ done: false });
    }
  } catch {
    res.status(500).json({ done: false });
  }
};

export default handler;
