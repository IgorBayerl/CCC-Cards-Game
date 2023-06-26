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
import MobilePlayersList from '../MobilePlayersList'
import BannerVertical from '../Ads/BannerVertical'

interface IInGameLayoutProps {
  children: React.ReactNode
}

export default function InGameLayout({ children }: IInGameLayoutProps) {
  const { roomId, gameState, gameConfig, leaveRoom } = useGameContext()

  const playersList = gameState.players
  const roomSize = gameConfig?.roomSize?.toString() || '4'

  const handleLeaveRoom = () => {
    void router.push('/')
    leaveRoom()
  }

  useEffect(() => {
    if (!roomId) handleLeaveRoom()
  }, [roomId])

  return (
    <div className="min-h-screen-safe flex flex-col justify-between md:justify-center md:p-5">
      <div className="flex items-center justify-center">
        <div className="hidden md:block">
          {/* <BannerVertical /> */}
        </div>
        <div className="game-container-border flex h-[100svh] flex-col justify-between gap-3 md:h-[80vh] ">
          <div className="px-1">
            <ContainerHeader />
          </div>
          <div className="md:hidden" id="mobile-player-list">
            <div className="flex w-screen gap-3 overflow-x-scroll px-2 py-3 ">
              <MobilePlayersList
                players={playersList}
                leader={gameState.leader}
                roomSize={parseInt(roomSize)}
              />
            </div>
          </div>
          <div className="flex h-full overflow-clip">
            <div className="hidden flex-col gap-2 md:flex">
              <PlayersList
                players={playersList}
                leader={gameState.leader}
                roomSize={parseInt(roomSize)}
              />
            </div>
            <div className="flex w-full flex-col justify-between ">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
