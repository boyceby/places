import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { Coords } from "../../models/coords";
import type { Place } from "../../models/place";
import { SessionsRespData } from "../../pages/api/sessions";

export type NavigationState = {
  userCoords: Coords | null;
  userCoordsLoading: "pending" | "failed" | "succeeded";
  destination: Place | null;
  directions: google.maps.DirectionsResult | null;
  directionsLoading: "pending" | "failed" | "succeeded" | null;
};

const initialState: NavigationState = {
  userCoords: null,
  userCoordsLoading: "pending",
  destination: null,
  directions: null,
  directionsLoading: null,
};

export const getUserCoords = createAsyncThunk(
  "navigation/getUserCoords",
  async () => {
    const response = await fetch(`/api/sessions`);
    if (!response.ok) {
      return Promise.reject(new Error("Error fetching session info"));
    } else {
      const data = (await response.json()) as SessionsRespData;
      return data.location!;
    }
  }
);

export const getDirectionsToDestination = createAsyncThunk(
  "navigation/getDirectionsToDestination",
  async (_, thunkAPI) => {
    const { userCoords, destination } = (thunkAPI.getState() as RootState)
      .navigation;
    if (!userCoords || !destination) {
      return null;
    } else {
      const directionsService = new google.maps.DirectionsService();
      let directions: google.maps.DirectionsResult;
      try {
        directions = await directionsService.route({
          origin: userCoords,
          destination: { placeId: destination.id },
          travelMode: google.maps.TravelMode.DRIVING,
        });
      } catch {
        return Promise.reject(new Error("Error fetching directions"));
      }
      return directions;
    }
  }
);

export const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setDestination: (state, action: PayloadAction<Place>) => {
      state.destination = action.payload;
    },
    clearDirectionsAndDestination: (state) => {
      state.directions = null;
      state.destination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* getUserCoords */
      .addCase(getUserCoords.rejected, (state) => {
        state.userCoordsLoading = "failed";
      })
      .addCase(getUserCoords.pending, (state) => {
        state.userCoordsLoading = "pending";
      })
      .addCase(getUserCoords.fulfilled, (state, action) => {
        state.userCoords = action.payload;
        state.userCoordsLoading = "succeeded";
      })
      /* getDirectionsToDestination */
      .addCase(getDirectionsToDestination.rejected, (state) => {
        state.directionsLoading = "failed";
      })
      .addCase(getDirectionsToDestination.pending, (state) => {
        state.directionsLoading = "pending";
      })
      .addCase(getDirectionsToDestination.fulfilled, (state, action) => {
        if (action.payload) {
          state.directions = action.payload;
          state.directionsLoading = "succeeded";
        }
      });
  },
});

export const { setDestination, clearDirectionsAndDestination } =
  navigationSlice.actions;

export const selectNavigationUserCoords = (state: RootState) =>
  state.navigation.userCoords;
export const selectNavigationUserCoordsLoading = (state: RootState) =>
  state.navigation.userCoordsLoading;
export const selectNavigationDestination = (state: RootState) =>
  state.navigation.destination;
export const selectNavigationDirections = (state: RootState) =>
  state.navigation.directions;
export const selectNavigationDirectionsLoading = (state: RootState) =>
  state.navigation.directionsLoading;

export default navigationSlice.reducer;
