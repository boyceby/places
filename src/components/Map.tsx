import { useCallback, useEffect, useRef } from "react";
import {
  useLoadScript,
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getUserCoords,
  selectNavigationDestination,
  selectNavigationDirections,
  selectNavigationUserCoords,
  selectNavigationUserCoordsLoading,
} from "../store/navigation/navigationSlice";
import { useTheme } from "@mui/material/styles";
import { DARK_THEME_MAP_STYLING } from "../styling/darkThemeMapStyling"
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

let isFirstEverRender = true;

const Map: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const userCoords = useAppSelector(selectNavigationUserCoords);
  const userCoordsLoading = useAppSelector(selectNavigationUserCoordsLoading);
  const destination = useAppSelector(selectNavigationDestination);
  const directions = useAppSelector(selectNavigationDirections);

  useEffect(() => {
    if (isFirstEverRender) {
      dispatch(getUserCoords());
      isFirstEverRender = false;
    }
  }, [dispatch]);

  const ref = useRef<google.maps.Map>();

  const options = {
    disableDefaultUI: true,
    clickableIcons: false,
    styles: theme.palette.mode === "light" ? [] : DARK_THEME_MAP_STYLING,
  };

  const updateRef = useCallback((map: google.maps.Map) => {
    ref.current = map;
  }, []);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  return userCoords && userCoordsLoading === "succeeded" && isLoaded ? (
    <GoogleMap
      zoom={13}
      center={new google.maps.LatLng(userCoords.lat, userCoords.lng)}
      options={options}
      onLoad={updateRef}
      mapContainerStyle={{ width: "100%", height: "100vh" }}
    >
      <Marker
        position={userCoords}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          strokeColor: theme.palette.mode === "light" ? "black" : "white",
        }}
        options={{ clickable: false, zIndex: 3 }}
      />
      {destination && directions && (
        <>
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                zIndex: 2,
                strokeColor: "black",
                strokeWeight: 4,
              },
              markerOptions: {
                visible: false,
              },
            }}
          />
          <Marker
            position={destination.coords}
            options={{ clickable: false, zIndex: 3 }}
          />
        </>
      )}
    </GoogleMap>
  ) : (
    <Stack
      width="100%"
      height="100vh"
      justifyContent="center"
      alignItems="center"
    >
      <CircularProgress />
    </Stack>
  );
};

export default Map;
