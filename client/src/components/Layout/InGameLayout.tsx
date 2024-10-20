import router from 'next/router'
import { useCallback, useEffect } from 'react'
import { useGameContext } from '../GameContext'
import PlayersList from '../PlayersList'
import ContainerHeader from './ContainerHeader'
import MobilePlayersList from '../MobilePlayersList'
// import BannerVertical from '../Ads/BannerVertical'

interface IInGameLayoutProps {
  children: React.ReactNode
}

export default function InGameLayout({ children }: IInGameLayoutProps) {
  const { roomId, gameState, gameConfig, leaveRoom } = useGameContext()

  const playersList = Array.from(gameState.players.values())

  const roomSize = gameConfig?.roomSize?.toString() || '4'

  const handleLeaveRoom = useCallback(() => {
    void router.push('/')
    leaveRoom()
  }, [leaveRoom])

  useEffect(() => {
    if (!roomId) handleLeaveRoom()
  }, [handleLeaveRoom, roomId])

  return (
    <div className="min-h-screen-safe flex flex-col justify-between md:justify-center md:p-5">
      <div className="flex items-center justify-center">
        <div className="hidden md:block">{/* <BannerVertical /> */}</div>
        <div className="game-container-border flex h-[100svh] flex-col justify-between gap-3 md:h-[80vh] ">
          <div className="px-1">
            <ContainerHeader />
          </div>
          <div className="md:hidden" id="mobile-player-list">
            <div className="flex w-screen gap-3 overflow-x-scroll px-2 py-3 ">
              <MobilePlayersList players={playersList} leaderId={gameState.leader} roomSize={parseInt(roomSize)} />
            </div>
          </div>
          <div className="flex h-full overflow-hidden">
            <div className="hidden flex-col gap-2 md:flex">
              <PlayersList players={playersList} leaderId={gameState.leader} roomSize={parseInt(roomSize)} />
            </div>
            <div className="flex w-full flex-col justify-between ">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
