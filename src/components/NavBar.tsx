import { useState, SyntheticEvent, MouseEventHandler, useEffect } from "react";
import { useRouter } from "next/router";
import { magic } from "../lib/magic/magicClient";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectGeneralFeedView,
  setFeedView,
} from "../store/general/generalSlice";
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ThemeSwitch from "./ThemeSwitch";
import Button from "@mui/material/Button";

const NavBar: React.FC<{ togglePaletteMode: () => void }> = ({
  togglePaletteMode,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [didToken, setDidToken] = useState("");
  const feedView = useAppSelector(selectGeneralFeedView);

  useEffect(() => {
    (async () => {
      try {
        if (!magic) {
          throw new Error("Error obtaining access to Magic client");
        } else {
          const didToken = await magic.user.getIdToken();
          setDidToken(didToken);
        }
      } catch (error) {
        console.error("Error retrieving didToken", error);
      }
    })();
  }, []);

  const handleTabChange = (event: SyntheticEvent, newTabValue: number) => {
    const newFeedView =
      newTabValue === 0 ? "results" : newTabValue === 1 ? "liked" : "viewed";
    dispatch(setFeedView(newFeedView));
  };

  const signOut: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/sessions", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${didToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
    } catch (error) {
      console.error("Error signing out", error);
      router.push("/signin");
    }
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      height="75px"
      borderBottom="1px solid"
    >
      <Tabs
        value={feedView === "results" ? 0 : feedView === "liked" ? 1 : 2}
        onChange={handleTabChange}
        aria-label="feed tabs"
        sx={{ marginBottom: "-1.5px" }}
      >
        <Tab icon={<SearchIcon />} label="Results" />
        <Tab icon={<FavoriteIcon />} label="Liked" />
        <Tab icon={<VisibilityIcon />} label="Viewed" />
      </Tabs>
      <Stack direction="row" alignItems="center" marginRight={2} spacing={2}>
        <ThemeSwitch togglePaletteMode={togglePaletteMode} />
        <Button
          variant="outlined"
          sx={{ whiteSpace: "nowrap" }}
          onClick={signOut}
        >
          Sign Out
        </Button>
      </Stack>
    </Stack>
  );
};

export default NavBar;
