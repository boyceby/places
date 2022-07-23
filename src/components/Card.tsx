import { MouseEventHandler, useState } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearDirectionsAndDestination,
  getDirectionsToDestination,
  selectNavigationDestination,
  selectNavigationDirectionsLoading,
  setDestination,
} from "../store/navigation/navigationSlice";
import Rating from "@mui/material/Rating";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import fallbackImg from "../../public/fallbackImage.jpg";
import { Place } from "../models/place";

const Card: React.FC<{
  place: Place | "loading";
}> = ({ place }) => {
  const dispatch = useAppDispatch();
  const loading = place === "loading";
  const [liked, setLiked] = useState<boolean | null>(
    loading ? null : place.liked
  );
  const currentDestination = useAppSelector(selectNavigationDestination);
  const directionsLoading = useAppSelector(selectNavigationDirectionsLoading);
  const [imgError, setImgError] = useState<boolean>(false);

  const toggleLike: MouseEventHandler<HTMLButtonElement> = async (event) => {
    if (!loading) {
      fetch(`/api/stats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          placeID: place.id,
          liked: !liked,
          viewed: true,
        }),
      });
      setLiked((prevState) => {
        return !prevState;
      });
    }
  };

  const toggleDirections: MouseEventHandler<HTMLButtonElement> = async (
    event
  ) => {
    if (!loading) {
      if (place.id === currentDestination?.id) {
        dispatch(clearDirectionsAndDestination());
      } else {
        await fetch(`/api/stats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            placeID: place.id,
            liked: liked,
            viewed: true,
          }),
        });
        dispatch(setDestination(place));
        dispatch(getDirectionsToDestination());
      }
    }
  };

  return (
    <Stack borderBottom="1px solid" padding="15px 15px 13px 17px">
      <Stack direction="row" justifyContent="space-between" spacing="15px">
        <Stack>
          <Stack spacing="5px">
            {loading ? (
              <>
                <Skeleton variant="text" width="250px" height="50px" />
                <Skeleton variant="text" width="225px" height="35px" />
                <Skeleton variant="text" width="215px" height="25px" />
              </>
            ) : (
              <>
                <Typography variant="h5" component="h2" fontWeight="bold">
                  {place.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="body2"
                    component="p"
                    border="0.5px solid"
                    borderRadius="3px"
                    padding="1px 5px"
                  >
                    {place.rating}
                  </Typography>
                  <Rating
                    name="read-only"
                    value={place.rating}
                    readOnly
                    precision={0.25}
                  />
                  <Typography variant="body1" component="p">
                    ({place.rating_count})
                  </Typography>
                </Stack>
                <Typography variant="subtitle1" component="p">
                  {place.address}
                </Typography>
              </>
            )}
          </Stack>
          <Stack direction="row" alignItems="center" ml="-8px">
            {loading ? (
              <>
                <Skeleton
                  variant="circular"
                  width="30px"
                  height="30px"
                  sx={{ marginLeft: "8px", marginTop: "4px" }}
                />
                <Skeleton
                  variant="circular"
                  width="30px"
                  height="30px"
                  sx={{ marginLeft: "8px", marginTop: "4px" }}
                />
              </>
            ) : (
              <>
                <IconButton onClick={toggleDirections}>
                  {place.id === currentDestination?.id &&
                  directionsLoading === "pending" ? (
                    <CircularProgress size={24} />
                  ) : place.id === currentDestination?.id &&
                    directionsLoading === "succeeded" ? (
                    <LocationOnIcon />
                  ) : (
                    <LocationOnOutlinedIcon />
                  )}
                </IconButton>
                <IconButton onClick={toggleLike}>
                  {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </>
            )}
          </Stack>
        </Stack>

        <Stack justifyContent="center">
          {loading ? (
            <Skeleton variant="rectangular" width="175px" height="125px" />
          ) : (
            <Box
              minWidth="175px"
              height="125px"
              border="1px solid"
              borderRadius="2px"
              overflow="hidden"
            >
              <Image
                src={
                  imgError
                    ? fallbackImg
                    : `https://maps.googleapis.com/maps/api/place/photo?` +
                      `maxwidth=175` +
                      `&maxheight=125` +
                      `&photo_reference=${place.photos[0]?.photo_reference}` +
                      `&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
                }
                onError={() => setImgError(true)}
                width={175}
                height={125}
                alt="An image representing the place"
              ></Image>
            </Box>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Card;
