
import { useEffect, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { selectGeneralFeedView } from "../store/general/generalSlice";
import {
  selectSearchShowPlaceholderResults,
  selectSearchQuery,
} from "../store/search/searchSlice";
import Card from "./Card";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Place } from "../models/place";
import { PlacesRespData } from "../pages/api/places";

const Feed: React.FC = () => {
  const type = useAppSelector(selectGeneralFeedView);
  const showPlaceholderResults = useAppSelector(
    selectSearchShowPlaceholderResults
  );
  const searchQuery = useAppSelector(selectSearchQuery);
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState<
    "failed" | "pending" | "fulfilled"
  >("pending");

  useEffect(() => {
    setPlacesLoading("pending");

    let resourceURL: string;
    if (type === "results" && showPlaceholderResults) {
      resourceURL = "/api/places?type=nearbyPopular";
    } else if (type === "results") {
      resourceURL = `/api/places?type=search&query=${searchQuery}`;
    } else {
      resourceURL = `/api/places?type=${type}`;
    }

    const fetchPlaces = async () => {
      const response = await fetch(resourceURL);
      const data = (await response.json()) as PlacesRespData;
      if (!response.ok) {
        setPlacesLoading("failed");
      } else {
        setPlaces(data.data!);
        setPlacesLoading("fulfilled");
      }
    };

    fetchPlaces();
  }, [type, searchQuery, showPlaceholderResults]);

  if (placesLoading === "failed") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography variant="body1" component="p">
          We&apos;re sorry, we&apos;ve encountered an error - please try again!
        </Typography>
      </Box>
    );
  } else if (placesLoading === "pending") {
    return (
      <Stack overflow="scroll">
        <Card place={"loading"}></Card>
        <Card place={"loading"}></Card>
        <Card place={"loading"}></Card>
        <Card place={"loading"}></Card>
        <Card place={"loading"}></Card>
        <Card place={"loading"}></Card>
      </Stack>
    );
  } else if (places.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          textAlign: "center",
          padding: "80px",
        }}
      >
        <Typography variant="body1" component="p">
          {type === "results"
            ? "No results."
            : type === "liked"
            ? "No results - like places for them to show up here!"
            : "No results - like or get directions to places for them to show up here!"}
        </Typography>
      </Box>
    );
  } else {
    return (
      <Stack overflow="scroll">
        {places.map((place) => (
          <Card key={place.id} place={place}></Card>
        ))}
      </Stack>
    );
  }
};

export default Feed;
