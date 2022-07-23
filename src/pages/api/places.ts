import type { NextApiRequest, NextApiResponse } from "next";
import { verifyTokenExtractInfo } from "../../lib/utils";
import { Place } from "../../models/place";
import {
  getUserSpecificPlaces,
  getNearbyPopularPlaces,
  getPlacesBySearch,
} from "../../lib/places";

export type PlacesRespData = {
  action: "none" | "search" | "liked" | "viewed" | "nearbyPopular";
  data?: Place[];
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<PlacesRespData>
) => {
  try {
    if (req.method !== "GET") {
      res
        .status(405)
        .setHeader("Allow", JSON.stringify(["GET"]))
        .send({ action: "none" });
    } else {
      const token = req.cookies.token;
      const verifiedToken = await verifyTokenExtractInfo(token);
      if (!verifiedToken) {
        res.status(401).send({ action: "none" });
      } else {
        const { issuer: userIssuer } = verifiedToken;
        switch (req.query.type) {
          case "search": {
            const query = req.query.query;
            if (!query || typeof query !== "string") {
              res.status(400).send({ action: "none" });
            } else {
              const { location: userCoords } = verifiedToken;
              const places = await getPlacesBySearch(
                token,
                userIssuer,
                userCoords,
                query
              );
              res.status(200).send({ action: "search", data: places });
            }
            break;
          }
          case "liked": {
            const likedPlaces = await getUserSpecificPlaces(
              token,
              userIssuer,
              "liked"
            );
            res.status(200).send({ action: "liked", data: likedPlaces });
            break;
          }
          case "viewed": {
            const viewedPlaces = await getUserSpecificPlaces(
              token,
              userIssuer,
              "viewed"
            );
            res.status(200).send({ action: "viewed", data: viewedPlaces });
            break;
          }
          case "nearbyPopular": {
            const { location: userCoords } = verifiedToken;
            const nearbyPopularPlaces = await getNearbyPopularPlaces(
              token,
              userIssuer,
              userCoords
            );
            res
              .status(200)
              .send({ action: "nearbyPopular", data: nearbyPopularPlaces });
            break;
          }
          default: {
            res.status(400).send({ action: "none" });
            break;
          }
        }
      }
    }
  } catch (error) {
    res.status(500).json({ action: "none" });
  }
};

export default handler;
