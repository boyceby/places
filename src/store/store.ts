import {
  Action,
  configureStore,
  ThunkAction,
} from "@reduxjs/toolkit";
import generalReducer from "./general/generalSlice";
import searchReducer from "./search/searchSlice";
import navigationReducer from "./navigation/navigationSlice";

export const store = configureStore({
  reducer: {
    general: generalReducer,
    search: searchReducer,
    navigation: navigationReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
