import { type AppType } from "next/dist/shared/lib/utils";
import { ToastContainer } from "react-toastify";
import { SocketProvider } from '~/components/SocketContext'
import { GameProvider } from '~/components/GameContext'

import Head from 'next/head'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import 'react-toastify/dist/ReactToastify.css'
import '~/styles/globals.css'
import { AudioProvider } from '~/components/AudioContext'

const url = process.env.NEXT_PUBLIC_GAME_SERVER || 'http://localhost:3365'

const queryClient = new QueryClient()

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>CCC - Cyber Chaos Cards</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="icon" type="image/x-icon" href="icon_dark.ico" />
      </Head>
      <ToastContainer />
      <QueryClientProvider client={queryClient}>
        <SocketProvider url={url}>
          <GameProvider>
            <AudioProvider>
              <Component {...pageProps} />
            </AudioProvider>
          </GameProvider>
        </SocketProvider>
        {/* <ReactQueryDevtools /> */}
      </QueryClientProvider>
    </>
  )
}

export default MyApp;
