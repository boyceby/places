import { Coords } from "../../models/coords";
import { PlaceInfo, DetailedPlaceInfo, PlacePhoto } from "../../models/place";
import { RESULT_RADIUS } from "./googleFetcherConfig";

/* Google API Response Interfaces */

interface GooglePlaceDetailsBasicResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: Coords;
  };
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  price_level: number;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  photos?: PlacePhoto[];
}

interface GooglePlaceDetailsDetailedResult
  extends GooglePlaceDetailsBasicResult {
  formatted_phone_number: string;
  website: string;
}

interface GooglePlaceDetailsResp {
  status: string;
  result: GooglePlaceDetailsBasicResult | GooglePlaceDetailsDetailedResult;
}

interface GooglePlaceTextSearchResp {
  status: string;
  results: {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: Coords;
    };
    opening_hours: {
      open_now: boolean;
    };
    price_level: number;
    rating: number;
    user_ratings_total: number;
    types: string[];
    photos?: PlacePhoto[];
  }[];
}

interface GooglePlaceNearbySearchResp {
  status: string;
  results: {
    place_id: string;
    name: string;
    vicinity: string;
    geometry: {
      location: Coords;
    };
    opening_hours: {
      open_now: boolean;
    };
    price_level: number;
    rating: number;
    user_ratings_total: number;
    types: string[];
    photos?: PlacePhoto[];
  }[];
}

/* Place and PlaceInfo Fetchers */

export async function fetchPlaceInfoByID(
  placeID: string,
  detailed: false
): Promise<PlaceInfo>;
export async function fetchPlaceInfoByID(
  placeID: string,
  detailed: true
): Promise<DetailedPlaceInfo>;
export async function fetchPlaceInfoByID(placeID: string, detailed: boolean) {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY not set");
  }
  try {
    const BASE_URL = "https://maps.googleapis.com/maps/api/place/details/json";

    let fields = [
      "place_id",
      "name",
      "formatted_address",
      "geometry",
      "rating",
      "user_ratings_total",
      "price_level",
      "opening_hours",
      "types",
      "photos",
    ];

    if (detailed) fields.push("formatted_phone_number", "website");

    const resp = await fetch(
      `${BASE_URL}?place_id=${placeID}&fields=${fields.join("%2C")}&key=${
        process.env.GOOGLE_MAPS_API_KEY
      }`
    );

    const data = (await resp.json()) as GooglePlaceDetailsResp;

    if (data.status !== "OK") {
      const error = "Unsuccessful response from Google fetching place info";
      return Promise.reject(error);
    } else if (detailed) {
      const result = data.result as GooglePlaceDetailsDetailedResult;
      return {
        id: result.place_id,
        name: result.name,
        address: result.formatted_address,
        coords: result.geometry.location,
        rating: result.rating || 0,
        rating_count: result.user_ratings_total || 0,
        price_level: result.price_level,
        open_now: result.opening_hours?.open_now,
        types: result.types,
        photos: result.photos || [],
        tel: result.formatted_phone_number || null,
        website: result.website || null,
        hours: result.opening_hours?.weekday_text || [],
      } as DetailedPlaceInfo;
    } else {
      const result = data.result as GooglePlaceDetailsBasicResult;
      return {
        id: result.place_id,
        name: result.name,
        address: result.formatted_address,
        coords: result.geometry.location,
        rating: result.rating || 0,
        rating_count: result.user_ratings_total || 0,
        price_level: result.price_level,
        open_now: result.opening_hours?.open_now,
        types: result.types,
        photos: result.photos || [],
      } as PlaceInfo;
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

export const fetchPlaceInfosWithTextSearch = async (
  query: string,
  coords: Coords
): Promise<PlaceInfo[]> => {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY not set");
  }

  const BASE_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";
  const formattedQuery = encodeURIComponent(query);
  const formattedCoords = `${coords.lat}%2C${coords.lng}`;
  const resp = await fetch(
    BASE_URL +
      `?query=${formattedQuery}` +
      `&location=${formattedCoords}` +
      `&radius=${RESULT_RADIUS}` +
      `&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );

  const data = (await resp.json()) as GooglePlaceTextSearchResp;

  if (data.status !== "OK")
    throw new Error("Unsuccessful response from Google");

  const placeInfos = data.results.map((place) => {
    return {
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      coords: place.geometry.location,
      rating: place.rating || 0,
      rating_count: place.user_ratings_total || 0,
      price_level: place.price_level,
      open_now: place.opening_hours?.open_now,
      types: place.types,
      photos: place.photos || [],
    };
  });

  return placeInfos;
};

export const fetchPlaceInfosWithNearbySearch = async (
  keyword: string,
  coords: Coords
): Promise<PlaceInfo[]> => {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY not set");
  }

  const BASE_URL =
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
  const formattedKeyword = encodeURIComponent(keyword);
  const formattedCoords = `${coords.lat}%2C${coords.lng}`;
  const resp = await fetch(
    BASE_URL +
      `?keyword=${formattedKeyword}` +
      `&location=${formattedCoords}` +
      `&radius=${RESULT_RADIUS}` +
      `&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );

  const data = (await resp.json()) as GooglePlaceNearbySearchResp;

  if (data.status !== "OK")
    throw new Error("Unsuccessful response from Google");

  const placeInfos = data.results.map((place) => {
    return {
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      coords: place.geometry.location,
      rating: place.rating || 0,
      rating_count: place.user_ratings_total || 0,
      price_level: place.price_level,
      open_now: place.opening_hours?.open_now,
      types: place.types,
      photos: place.photos || [],
    };
  });

  return placeInfos;
};
