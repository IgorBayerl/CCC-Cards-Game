import { type AppType } from 'next/dist/shared/lib/utils'
import { ToastContainer } from 'react-toastify'
// import { SocketProvider } from '~/components/SocketContext'
import { GameProvider } from '~/components/GameContext'

import Head from 'next/head'
import { QueryClient, QueryClientProvider } from 'react-query'
import { NextSeo } from 'next-seo';

import 'react-toastify/dist/ReactToastify.css'
import '~/styles/globals.css'
import { AudioProvider } from '~/components/AudioContext'
import TrackingCode from '~/components/TrackingCode'


const queryClient = new QueryClient()

const MyApp: AppType = ({ Component, pageProps }) => {

  return (
    <>
      <TrackingCode />
      <NextSeo
        title="Cyber Chaos Cards"
        description="Join Cyber Chaos Cards - the edgy online adaptation of Cards Against Humanity. Make friends, create hilarity, challenge norms."
        canonical="https://www.cyberchaoscards.com/"
        openGraph={{
          url: 'https://www.cyberchaoscards.com/',
          title: 'Cyber Chaos Cards',
          description:
            'Join Cyber Chaos Cards - the edgy online adaptation of Cards Against Humanity. Make friends, create hilarity, challenge norms.',
          siteName: 'Cyber Chaos Cards',
        }}
      />
      <Head>
        <title>Cyber Chaos Cards</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="icon" type="image/x-icon" href="icon_dark.ico" />

        <meta name="title" content="Cyber Chaos Cards" />
        <meta
          name="description"
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
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="author" content="Igor Bayerl" />

        <meta name="google-site-verification" content="mtI8bECFOtk3xVJvSMCx-devj_czMM88dfw1pQnNlA4" />
      </Head>
      <ToastContainer />
      <QueryClientProvider client={queryClient}>
        <AudioProvider>
          <GameProvider>
            {/* <DevTools /> */}
            <Component {...pageProps} />
          </GameProvider>
        </AudioProvider>
        {/* <ReactQueryDevtools /> */}
      </QueryClientProvider>
    </>
  )
}

export default MyApp
