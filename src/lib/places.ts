import { Coords } from "../models/coords";
import {
  Place,
  PlaceInfo,
  DetailedPlaceInfo,
  DetailedPlace,
} from "../models/place";
import {
  getLikedPlacesStats,
  getStat,
  getStats,
  getViewedPlacesStats,
} from "./db/hasura";
import {
  fetchPlaceInfoByID,
  fetchPlaceInfosWithNearbySearch,
  fetchPlaceInfosWithTextSearch,
} from "./google/fetchPlaceInfos";

export const getDetailedPlace = async (
  jwtToken: string,
  userIssuer: string,
  placeID: string
): Promise<DetailedPlace> => {
  const detailedPlaceInfo = await fetchPlaceInfoByID(placeID, true);
  return await combineWithPlaceStatGetDetailedPlace(
    jwtToken,
    userIssuer,
    detailedPlaceInfo
  );
};

export const getPlacesBySearch = async (
  jwtToken: string,
  userIssuer: string,
  coords: Coords,
  query: string
): Promise<Place[]> => {
  const placeInfos = await fetchPlaceInfosWithTextSearch(query, coords);
  return await combineWithPlaceStatsGetPlaces(jwtToken, userIssuer, placeInfos);
};

export const getNearbyPopularPlaces = async (
  jwtToken: string,
  userIssuer: string,
  coords: Coords
): Promise<Place[]> => {
  const placeInfos = await fetchPlaceInfosWithNearbySearch(
    "restaurant",
    coords
  );

  return await combineWithPlaceStatsGetPlaces(jwtToken, userIssuer, placeInfos);
};

export const getUserSpecificPlaces = async (
  jwtToken: string,
  userIssuer: string,
  type: "liked" | "viewed"
): Promise<Place[]> => {
  const getPlacesStats =
    type === "liked" ? getLikedPlacesStats : getViewedPlacesStats;

  const placeStats = await getPlacesStats(jwtToken, userIssuer);

  const placeInfos = (
    await Promise.allSettled(
      placeStats.map((placeStat) => {
        return fetchPlaceInfoByID(placeStat.placeID, false);
      })
    )
  )
    .filter(
      (placeInfoSettledProm) => placeInfoSettledProm.status === "fulfilled"
    )
    .map((placeInfoFulfilledProm) => {
      const placeInfo = (
        placeInfoFulfilledProm as PromiseFulfilledResult<PlaceInfo>
      ).value;
      return placeInfo;
    });

  const places = placeStats
    .map((stat) => {
      const placeInfo = placeInfos.find(
        (placeInfo) => placeInfo.id === stat.placeID
      );
      if (placeInfo) {
        return {
          ...placeInfo,
          liked: stat.liked,
          viewed: stat.viewed,
        };
      } else {
        return null;
      }
    })
    .flatMap((place) => (place ? [place] : []));

  return places;
};

/* HELPERS */

const combineWithPlaceStatGetDetailedPlace = async (
  jwtToken: string,
  userIssuer: string,
  detailedPlaceInfo: DetailedPlaceInfo
): Promise<DetailedPlace> => {
  const placeStat = await getStat(jwtToken, userIssuer, detailedPlaceInfo.id);
  if (!placeStat) {
    throw new Error(`No stat for place with ID ${detailedPlaceInfo.id} found`);
  } else {
    return {
      ...detailedPlaceInfo,
      liked: placeStat.liked,
      viewed: placeStat.viewed,
    };
  }
};

const combineWithPlaceStatsGetPlaces = async (
  jwtToken: string,
  userIssuer: string,
  placeInfos: PlaceInfo[]
): Promise<Place[]> => {
  const existingPlaceStats = await getStats(jwtToken, userIssuer);

  const places = placeInfos.map((placeInfo) => {
    const existingPlaceStat = existingPlaceStats.find(
      (stat) => stat.placeID === placeInfo.id
    );
    if (existingPlaceStat) {
      return {
        ...placeInfo,
        liked: existingPlaceStat.liked,
        viewed: existingPlaceStat.viewed,
      };
    } else {
      return {
        ...placeInfo,
        liked: false,
        viewed: false,
      };
    }
  });

  return places;
};
