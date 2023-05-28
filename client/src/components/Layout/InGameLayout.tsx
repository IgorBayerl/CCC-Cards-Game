import router from 'next/router'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import { CopyToClipboard } from '../Atoms/CopyToClipboard'
import { useGameContext } from '../GameContext'
import PlayersList from '../PlayersList'
import Image from 'next/image'
import MuteButton from '../Atoms/MuteButton'
import ContainerFooter from './ContainerFooter'
import ContainerHeader from './ContainerHeader'

interface IInGameLayoutProps {
  children: React.ReactNode
}

export default function InGameLayout({ children }: IInGameLayoutProps) {
  const { roomId, gameState, gameConfig, leaveRoom } = useGameContext()

  const handleLeaveRoom = () => {
    void router.push('/')
    leaveRoom()
  }

  useEffect(() => {
    if (!roomId) handleLeaveRoom()
  }, [roomId])

  return (
    <div className="flex min-h-screen flex-col justify-between px-5 py-5 md:justify-center">
      <ContainerHeader />
      <div className="flex flex-col overflow-hidden rounded-xl border sm:flex-row">
        <div className="min-w-fit">
          <PlayersList
            players={gameState.players}
            leader={gameState.leader}
            roomSize={gameConfig.roomSize}
          />
        </div>
        <div className="">{children}</div>
      </div>
      <ContainerFooter />
    </div>
  )
}
