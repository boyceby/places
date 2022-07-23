import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

const Logo: React.FC = () => {
  return (
    <Paper
      sx={{
        width: "650px",
        border: "1px solid",
        borderRadius: "7.5px",
      }}
      elevation={1}
    >
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={3}
      >
        <Box
          sx={{
            width: "300px",
            height: "60px",
            backgroundColor: "#fff",
            border: "1px solid",
            borderRadius: "7.5px",
          }}
        />
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: "bold",
            cursor: "default",
            userSelect: "none",
          }}
        >
          Places
        </Typography>
      </Stack>
    </Paper>
  );
};

export default Logo;
