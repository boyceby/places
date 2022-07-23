export interface Coords {
  lat: number;
  lng: number;
}

export const isCoords = (variable: any): variable is Coords => {
  if (
    variable &&
    typeof variable === "object" &&
    variable.hasOwnProperty("lat") &&
    variable.hasOwnProperty("lng") &&
    typeof variable.lat === "number" &&
    typeof variable.lng === "number"
  ) {
    return true;
  } else {
    return false;
  }
};
