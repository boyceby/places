import { useState, useMemo, useEffect, useRef, HTMLAttributes } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import parse from "autosuggest-highlight/parse";
import throttle from "lodash/throttle";
import { RESULT_RADIUS } from "../lib/google/googleFetcherConfig";
import {
  disableShowPlaceholderResults,
  setQuery,
} from "../store/search/searchSlice";
import { setFeedView } from "../store/general/generalSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectNavigationUserCoords } from "../store/navigation/navigationSlice";

function loadScript(src: string, position: HTMLElement | null, id: string) {
  if (!position) {
    return;
  }

  const script = document.createElement("script");
  script.setAttribute("async", "");
  script.setAttribute("id", id);
  script.src = src;
  position.appendChild(script);
}

const autocompleteService = { current: null };

interface MainTextMatchedSubstrings {
  offset: number;
  length: number;
}
interface StructuredFormatting {
  main_text: string;
  secondary_text: string;
  main_text_matched_substrings: readonly MainTextMatchedSubstrings[];
}
type PlaceType = {
  description: string;
  structured_formatting: StructuredFormatting;
};

const AutocompleteSearch = () => {
  const dispatch = useAppDispatch();
  const userCoords = useAppSelector(selectNavigationUserCoords);
  const [value, setValue] = useState<PlaceType | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<readonly PlaceType[]>([]);
  const loaded = useRef(false);

  if (typeof window !== "undefined" && !loaded.current) {
    if (!document.querySelector("#google-maps")) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`,
        document.querySelector("head"),
        "google-maps"
      );
    }

    loaded.current = true;
  }

  const fetch = useMemo(
    () =>
      throttle(
        (
          request: {
            input: string;
            location: google.maps.LatLng;
            radius: number;
          },
          callback: (results?: readonly PlaceType[]) => void
        ) => {
          (autocompleteService.current as any).getPlacePredictions(
            request,
            callback
          );
        },
        200
      ),
    []
  );

  useEffect(() => {
    let active = true;

    if (!autocompleteService.current && (window as any).google) {
      autocompleteService.current = new (
        window as any
      ).google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch(
      {
        input: inputValue,
        location: new google.maps.LatLng(
          userCoords || { lat: 40.74856371896607, lng: -73.98566218064242 }
        ),
        radius: RESULT_RADIUS,
      },
      (results?: readonly PlaceType[]) => {
        if (active) {
          let newOptions: readonly PlaceType[] = [];

          if (value) {
            newOptions = [value];
          }

          if (results) {
            newOptions = [...newOptions, ...results];
          }

          setOptions(newOptions);
        }
      }
    );

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch, userCoords]);

  return (
    <Autocomplete
      id="google-places-autocomplete-search"
      sx={{
        width: 315,
      }}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.description
      }
      filterOptions={(x) => x}
      options={options}
      freeSolo
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Search" fullWidth />
      )}
      renderOption={(props, option) => {
        const matches =
          option.structured_formatting.main_text_matched_substrings;
        const parts = parse(
          option.structured_formatting.main_text,
          matches.map((match: any) => [
            match.offset,
            match.offset + match.length,
          ])
        );

        return (
          <li {...props}>
            <Grid container alignItems="center">
              <Grid item>
                <Box
                  component={LocationOnIcon}
                  sx={{ color: "text.secondary", mr: 2 }}
                />
              </Grid>
              <Grid item xs>
                {parts.map((part, index) => (
                  <span
                    key={index}
                    style={{
                      fontWeight: part.highlight ? 700 : 400,
                    }}
                  >
                    {part.text}
                  </span>
                ))}
                <Typography variant="body2" color="text.secondary">
                  {option.structured_formatting.secondary_text}
                </Typography>
              </Grid>
            </Grid>
          </li>
        );
      }}
      onKeyUp={(event: any) => {
        if (event.key === "Enter") {
          dispatch(setFeedView("results"));
          dispatch(disableShowPlaceholderResults());
          dispatch(setQuery(event.target.value));
        }
      }}
      onChange={(event: any, newValue: any) => {
        const query = newValue?.structured_formatting?.main_text || "";
        dispatch(setFeedView("results"));
        dispatch(disableShowPlaceholderResults());
        dispatch(setQuery(query));
      }}
    />
  );
};

export default AutocompleteSearch;

/* Source (adapted): https://github.com/mui/material-ui/blob/v5.8.7/docs/data/material/components/autocomplete/GoogleMaps.tsx */
