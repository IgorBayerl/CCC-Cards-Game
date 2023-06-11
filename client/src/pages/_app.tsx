import { type AppType } from 'next/dist/shared/lib/utils'
import { ToastContainer } from 'react-toastify'
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

        <meta name="title" content="Cyber Chaos Cards" />
        <meta
          name="description"
          lang="en"
          content="Join Cyber Chaos Cards - the edgy online adaptation of Cards Against Humanity. Make friends, create hilarity, challenge norms."
        />
        <meta
          name="description"
          lang="pt"
          content="Junte-se ao Cyber Chaos Cards - a ousada adaptação online de Cartas Contra Humanidade. Faça amigos, ria muito, desafie normas."
        />
        <meta
          name="keywords"
          content="Cyber Chaos Cards, Online Game, Cards Against Humanity, Digital Card Game, Multiplayer, Social Game, Adult Humor, Interactive Entertainment, Online Gaming, Virtual Game Night"
        />
        <meta name="robots" content="index, follow" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="author" content="Igor Bayerl" />

        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-TB0SDCXYQY"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TB0SDCXYQY');
            `,
          }}
        />
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

export default MyApp
