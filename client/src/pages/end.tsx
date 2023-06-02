import { useGameContext } from '~/components/GameContext'
import router from 'next/router'
import Layout from '~/components/Layout/Layout'

import InGameLayout from '~/components/Layout/InGameLayout'
import GameCard from '~/components/Atoms/GameCard'
import { ICard, ICardAnswer } from '~/models/Deck'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

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
    isCurrentUserJudge,
  } = useGameContext()
  const myCards = myHand.cards

  const { players } = gameState
  // find the player with the highest score

  const winner = players.reduce(
    (prev, current) => (prev.score > current.score ? prev : current),
    { score: -Infinity, username: 'No players' }
  )

  function handleStartNewGame() {
    // TODO: implement this
    // socket?.emit('start-new-game')
  }

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
