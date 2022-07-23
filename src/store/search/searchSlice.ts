import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export type SearchState = {
  showPlaceholderResults: boolean;
  query: string;
};

const initialState: SearchState = {
  showPlaceholderResults: true,
  query: "",
};

export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    disableShowPlaceholderResults: (state) => {
      state.showPlaceholderResults = false;
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
  },
});

export const { disableShowPlaceholderResults, setQuery } = searchSlice.actions;

export const selectSearchShowPlaceholderResults = (state: RootState) =>
  state.search.showPlaceholderResults;
export const selectSearchQuery = (state: RootState) => state.search.query;

export default searchSlice.reducer;
