import Paper from "@mui/material/Paper";
import NavBar from "./NavBar";
import Feed from "./Feed";

const Main: React.FC<{ togglePaletteMode: () => void }> = ({
  togglePaletteMode,
}) => {
  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "750px",
        height: "100vh",
        borderLeft: "1px solid",
      }}
    >
      <NavBar togglePaletteMode={togglePaletteMode} />
      <Feed />
    </Paper>
  );
};

export default Main;
