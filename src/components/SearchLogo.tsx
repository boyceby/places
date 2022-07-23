import AutocompleteSearch from "./AutocompleteSearch";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

const SearchLogo: React.FC = () => {
  return (
    <Paper
      sx={{
        width: "650px",
        border: "1px solid",
        borderRadius: "7.5px",
        position: "fixed",
        top: "10px",
        left: "10px",
        zIndex: 1,
      }}
      elevation={1}
    >
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={3}
      >
        <AutocompleteSearch />
        <Typography
          variant="h1"
          component="h1"
          fontWeight="bold"
          sx={{ cursor: "default", userSelect: "none" }}
        >
          Places
        </Typography>
      </Stack>
    </Paper>
  );
};

export default SearchLogo;
