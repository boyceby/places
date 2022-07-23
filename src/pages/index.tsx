import type { NextPage } from "next";
import Stack from "@mui/material/Stack";
import Head from "next/head";
import Map from "../components/Map";
import Main from "../components/Main";
import SearchLogo from "../components/SearchLogo";

const Home: NextPage<{ togglePaletteMode: () => void }> = ({
  togglePaletteMode,
}) => {
  return (
    <>
      <Head>
        <title>Places</title>
        <meta name="description" content="Find places near you." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Stack direction={"row"} height={"100vh"}>
        <SearchLogo />
        <Map />
        <Main togglePaletteMode={togglePaletteMode} />
      </Stack>
    </>
  );
};

export default Home;
