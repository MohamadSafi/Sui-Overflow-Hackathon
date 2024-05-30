import { ThemeProvider } from "next-themes";
import "../css/tailwind.css";
import "../css/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import GlobalContexts from "./globalContexts";

function MyApp({ Component, pageProps }) {
  return (
    <GlobalContexts>
      <ThemeProvider attribute="class">
        <ChakraProvider>
          <div className="container">
            <Component {...pageProps} />
          </div>
        </ChakraProvider>
      </ThemeProvider>
    </GlobalContexts>
  );
}

export default MyApp;
