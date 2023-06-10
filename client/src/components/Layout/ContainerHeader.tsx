import MuteButton from '../Atoms/MuteButton'
import { useGameContext } from '../GameContext'
import Image from 'next/image'
import router from 'next/router'
import { SignOut } from '@phosphor-icons/react'
import CCCIconThemed from '../Atoms/CCCIconThemed'

export default function ContainerHeader() {
  const { leaveRoom } = useGameContext()

  const handleLeaveRoom = () => {
    void router.push('/')
    leaveRoom()
  }

  return (
    <div className="hidden w-full items-center justify-between md:flex">
      <button className="btn-outline btn " onClick={handleLeaveRoom}>
        <SignOut size={25} weight="bold" />
        BACK
      </button>
      <CCCIconThemed />
      <MuteButton />
    </div>
  )
}
