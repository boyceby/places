import { Coords } from "./coords";

export interface PlacePhoto {
  photo_reference: string;
  width: number;
  height: number;
  html_attributions: string[];
}

export interface PlaceInfo {
  id: string;
  name: string;
  address: string;
  coords: Coords;
  rating: number;
  rating_count: number;
  price_level: number;
  open_now?: boolean;
  types: string[];
  photos: PlacePhoto[];
}

export interface PlaceStat {
  liked: boolean;
  viewed: boolean;
}

export interface DetailedPlaceInfo extends PlaceInfo {
  tel: string | null;
  website: string | null;
  hours: string[];
}

export interface Place extends PlaceInfo, PlaceStat {}

export interface DetailedPlace extends DetailedPlaceInfo, PlaceStat {}
