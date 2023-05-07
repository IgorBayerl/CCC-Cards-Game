import { type AppType } from "next/dist/shared/lib/utils";
import { ToastContainer } from "react-toastify";
import { SocketProvider } from '~/components/SocketContext'
import { GameProvider } from '~/components/GameContext'
import {
  type ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from '@mantine/core'
import Head from 'next/head'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import 'react-toastify/dist/ReactToastify.css'
import '~/styles/globals.css'

const url = process.env.SERVER_URL || 'http://localhost:3365'

const queryClient = new QueryClient()

const MyApp: AppType = ({ Component, pageProps }) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light')
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))

  return (
    <>
      <Head>
        <title>CCC - Cyber Chaos Cards</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ToastContainer />
      <QueryClientProvider client={queryClient}>
        <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
        >
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{ colorScheme }}
          >
            <SocketProvider url={url}>
              <GameProvider>
                <Component {...pageProps} />
              </GameProvider>
            </SocketProvider>
          </MantineProvider>
        </ColorSchemeProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </>
  )
}

export default MyApp;
