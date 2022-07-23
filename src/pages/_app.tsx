import { useMemo, useState } from "react";
import { Provider } from "react-redux";
import Head from "next/head";
import { AppProps } from "next/app";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";
import { PaletteMode } from "@mui/material";

import { CacheProvider, EmotionCache } from "@emotion/react";
import createEmotionCache from "../styling/createEmotionCache";

import { store } from "../store/store";

const clientSideEmotionCache = createEmotionCache();

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          primary: {
            main: "#000",
          },
        }
      : {
          primary: {
            main: "#FFF",
          },
        }),
  },
});

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const [paletteMode, setPaletteMode] = useState<PaletteMode>(
    prefersDarkMode ? "dark" : "light"
  );

  const togglePalleteMode = useMemo(
    () => () => {
      setPaletteMode((prevPaletteMode: PaletteMode) =>
        prevPaletteMode === "light" ? "dark" : "light"
      );
    },
    []
  );

  const theme = useMemo(
    () => createTheme(getDesignTokens(paletteMode)),
    [paletteMode]
  );

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>
          <Component {...pageProps} togglePaletteMode={togglePalleteMode} />
        </Provider>
      </ThemeProvider>
    </CacheProvider>
  );
}
