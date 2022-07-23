import type { NextApiRequest, NextApiResponse } from "next";
import { getStat, insertStat, updateStat } from "../../lib/db/hasura";
import { verifyTokenExtractInfo } from "../../lib/utils";
import { Stat } from "../../models/stat";

export type StatsRespData = {
  action: "none" | "get" | "update" | "insert";
  data?: Stat;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<StatsRespData>
) => {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      res
        .status(405)
        .setHeader("Allow", JSON.stringify(["GET", "POST"]))
        .send({ action: "none" });
    } else {
      const token = req.cookies.token;
      const verifiedToken = await verifyTokenExtractInfo(token);
      if (!verifiedToken) {
        res.status(401).send({ action: "none" });
      } else {
        const { issuer: userIssuer } = verifiedToken;
        const placeID =
          req.method === "GET" ? req.query.placeID : req.body.placeID;
        if (!placeID || typeof placeID !== "string") {
          res.status(400).send({ action: "none" });
        } else {
          const statForUserAndPlace = await getStat(token, userIssuer, placeID);
          if (req.method === "GET") {
            if (statForUserAndPlace) {
              res
                .status(200)
                .send({ action: "get", data: statForUserAndPlace });
            } else {
              res.status(404).send({ action: "none" });
            }
          } else {
            const { liked, viewed } = req.body;
            if (typeof liked !== "boolean" || typeof viewed !== "boolean") {
              res.status(400).send({ action: "none" });
            } else {
              if (statForUserAndPlace) {
                const stat = await updateStat(token, {
                  userIssuer,
                  placeID,
                  liked,
                  viewed,
                });
                res.status(200).send({ action: "update", data: stat });
              } else {
                const stat = await insertStat(token, {
                  userIssuer,
                  placeID,
                  liked,
                  viewed,
                });
                res.status(200).send({ action: "insert", data: stat });
              }
            }
          }
        }
      }
    }
  } catch {
    res.status(500).send({ action: "none" });
  }
};

export default handler;
