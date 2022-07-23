import { NextPage } from "next";
import Head from "next/head";
import {
  useState,
  FormEventHandler,
  ChangeEventHandler,
  useEffect,
} from "react";
import { useRouter } from "next/router";
import { magic } from "../lib/magic/magicClient";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Logo from "../components/Logo";
import SignInAccordions from "../components/SignInAccordions";
import ThemeSwitch from "../components/ThemeSwitch";
import signInBackgroundImageLight from "../../public/signInBackgroundImageLight.png";
import signInBackgroundImageDark from "../../public/signInBackgroundImageDark.png";

const LOCATION_PANEL = 3;

const getCurrentPositionAwaitable = (
  options?: PositionOptions
): Promise<GeolocationPosition> => {
  return new Promise((success, error) =>
    navigator.geolocation.getCurrentPosition(success, error, options)
  );
};

const SignIn: NextPage<{ togglePaletteMode: () => void }> = ({
  togglePaletteMode,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const [emailInput, setEmailInput] = useState<string>("");
  const [isSignInLoading, setIsSignInLoading] = useState<boolean>(false);
  const [expandedPanel, setExpandedPanel] = useState<number | false>(false);

  useEffect(() => {
    const routeChangeHandler = () => {
      setIsSignInLoading(false);
    };
    router.events.on("routeChangeComplete", routeChangeHandler);
    router.events.on("routeChangeError", routeChangeHandler);
    return () => {
      router.events.off("routeChangeComplete", routeChangeHandler);
      router.events.off("routeChangeError", routeChangeHandler);
    };
  }, [router]);

  const onEmailChange: ChangeEventHandler = (event) => {
    setEmailInput((event.target as HTMLInputElement).value);
  };

  const onSignIn: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setIsSignInLoading(true);
    let userPosition: GeolocationPosition | null;
    try {
      userPosition = await getCurrentPositionAwaitable();
    } catch (error) {
      userPosition = null;
    }
    if (userPosition) {
      try {
        const didToken = await magic!.auth.loginWithMagicLink({
          email: emailInput,
        });
        if (didToken) {
          const response = await fetch("/api/sessions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${didToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              location: {
                lat: userPosition.coords.latitude,
                lng: userPosition.coords.longitude,
              },
            }),
          });
          if (response.ok) {
            router.push("/");
          } else {
            setIsSignInLoading(false);
            setEmailInput("");
          }
        }
      } catch {
        setIsSignInLoading(false);
        setEmailInput("");
      }
    } else {
      setIsSignInLoading(false);
      setExpandedPanel(LOCATION_PANEL);
    }
  };

  const makePanelChangeHandler =
    (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedPanel(isExpanded ? panel : false);
    };

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundImage: `url(${
          theme.palette.mode === "light"
            ? signInBackgroundImageLight.src
            : signInBackgroundImageDark.src
        })`,
      }}
    >
      <Box sx={{ height: "100vh", backdropFilter: "blur(4px)" }}>
        <Head>
          <title>Places - Sign In or Sign Up</title>
          <meta name="description" content="Sign in to find places near you." />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Container maxWidth="xl" sx={{ paddingTop: "100px" }}>
          <Stack direction="row" justifyContent="center" spacing={2}>
            <Stack spacing={2}>
              <Logo />
              <Stack direction="row" spacing={2}>
                <SignInAccordions
                  expanded={expandedPanel}
                  makeChangeHandler={makePanelChangeHandler}
                />
                <Paper
                  elevation={4}
                  sx={{
                    width: "318px",
                    height: "140px",
                    padding: "15px",
                    border: "1px solid",
                    display: "flex",
                    flexDirection: "column",
                    gap: "25px",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h4" component="h3" fontWeight="bold">
                      Sign In
                    </Typography>
                    <ThemeSwitch togglePaletteMode={togglePaletteMode} />
                  </Stack>
                  <form onSubmit={onSignIn}>
                    <Stack direction="row" spacing={2}>
                      <input
                        type="text"
                        value={emailInput}
                        placeholder="example@domain.com"
                        onChange={onEmailChange}
                        style={{
                          width: "100%",
                          outline: "none",
                          border: "1px solid",
                          borderRadius: "5px",
                          fontSize: "15px",
                          padding: "10px 15px",
                        }}
                      />
                      <Button
                        type="submit"
                        variant="outlined"
                        sx={{ whiteSpace: "nowrap", fontSize: "12px" }}
                      >
                        {isSignInLoading ? (
                          <CircularProgress size={25} />
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </Stack>
                  </form>
                </Paper>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default SignIn;
