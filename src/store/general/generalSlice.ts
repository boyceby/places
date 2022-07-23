import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { FeedView } from "../../models/feedView";

export type GeneralState = {
  feedView: FeedView;
  likedCache: string[];
};

const initialState: GeneralState = {
  feedView: "results",
  likedCache: [],
};

export const generalSlice = createSlice({
  name: "general",
  initialState,
  reducers: {
    setFeedView: (state, action: PayloadAction<FeedView>) => {
      state.feedView = action.payload;
    },
    addLikedPlace: (state, action: PayloadAction<string>) => {
      state.likedCache = [...state.likedCache, action.payload];
    },
    removeLikedPlace: (state, action: PayloadAction<string>) => {
      state.likedCache = state.likedCache.filter(
        (likedCacheElement) => likedCacheElement !== action.payload
      );
    },
  },
});

export const { setFeedView, addLikedPlace, removeLikedPlace } =
  generalSlice.actions;

export const selectGeneralFeedView = (state: RootState) =>
  state.general.feedView;
export const selectGeneralLikedCache = (state: RootState) =>
  state.general.likedCache;

export default generalSlice.reducer;
