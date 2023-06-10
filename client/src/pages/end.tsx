import { useGameContext } from '~/components/GameContext'
import router from 'next/router'
import Layout from '~/components/Layout/Layout'

import InGameLayout from '~/components/Layout/InGameLayout'
import GameCard, { GameCardResult } from '~/components/Atoms/GameCard'
import { ICard, ICardAnswer } from '~/models/Deck'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Image from 'next/image'
import ConfettiExplosion from 'react-confetti-explosion'

interface IUpdateResultCards {
  hasNext: boolean
  cards: { [playerId: string]: ICardAnswer[] }
}

export default function End() {
  const {
    myHand,
    socket,
    gameState,
    startingState,
    playerSelectCards,
    isCurrentUserLeader,
  } = useGameContext()
  const myCards = myHand.cards

  const { players } = gameState
  // find the player with the highest score

  const winner = players.reduce(
    (prev, current) => (prev.score > current.score ? prev : current),
    {
      score: -Infinity,
      username: 'No players',
      id: '',
      pictureUrl: '',
    }
  )

  const [keyTest, setKeyTest] = useState(0)

  function explodeConfetti() {
    setKeyTest((prev) => prev + 1)
    // TODO: implement this
    // socket?.emit('start-new-game')
  }

  function handleStartNewGame() {
    setKeyTest((prev) => prev + 1)
    // TODO: implement this
    // socket?.emit('start-new-game')
  }

  return (
    <InGameLayout>
      <div className="bg-destaque-mobile flex flex-1 flex-col py-2 md:mx-4">
        <h1 className="text-xl font-bold">Match Winner</h1>
        <div className="flex flex-1 items-center ">
          <div className="flex flex-1 flex-col items-center gap-3">
            <ConfettiExplosion key={keyTest} />
            <Image
              src={winner?.pictureUrl || ''}
              alt={winner?.username || ''}
              width={100}
              height={100}
              className="rounded-full border-4 border-neutral dark:border-white"
              onClick={explodeConfetti}
            />
            <h1 className="text-xl font-bold" onClick={explodeConfetti}>
              {winner?.username}
            </h1>
          </div>
        </div>
      </div>
      {isCurrentUserLeader && (
        <div className="flex items-center justify-center px-4 py-2">
          <button className="btn flex-1" onClick={handleStartNewGame}>
            Play Again
          </button>
        </div>
      )}
    </InGameLayout>
  )
  return (
    <Layout>
      <InGameLayout>
        <div className="">
          <h1>End</h1>
          {winner.username}
          <button onClick={handleStartNewGame}>Start New Game</button>
        </div>
      </InGameLayout>
    </Layout>
  )
}
