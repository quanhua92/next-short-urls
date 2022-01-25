import type { AppProps } from "next/app";
import Image from "next/image";
import { SWRConfig } from "swr";
import fetchJson from "../lib/fetchJson";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        fetcher: fetchJson,
      }}
    >
      <div>
        <Component {...pageProps} />
        <div className="fixed top-0 right-0">
          <a href="https://github.com/quanhua92/next-short-urls">
            <Image
              loading="lazy"
              width="149"
              height="149"
              src="https://github.blog/wp-content/uploads/2008/12/forkme_right_red_aa0000.png?resize=149%2C149"
              alt="Fork me on GitHub"
              data-recalc-dims="1"
            />
          </a>
        </div>
      </div>
    </SWRConfig>
  );
}

export default MyApp;
