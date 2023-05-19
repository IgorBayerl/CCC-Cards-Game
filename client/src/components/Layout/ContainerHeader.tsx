import { Button } from '@mantine/core'
import { IconArrowBack } from '@tabler/icons-react'
import MuteButton from '../Atoms/MuteButton'
import { useGameContext } from '../GameContext'
import Image from 'next/image'
import router from 'next/router'

export default function ContainerHeader() {
  const { leaveRoom } = useGameContext()

  const handleLeaveRoom = () => {
    void router.push('/')
    leaveRoom()
  }

  return (
    <div className="flex items-start justify-between">
      <Button
        leftIcon={<IconArrowBack size="1rem" />}
        onClick={handleLeaveRoom}
      >
        Leave Room
      </Button>
      <Image
        src="/icon_light.svg"
        alt="cyber chaos cards logo"
        title="logo"
        width={100}
        height={100}
      />
      <MuteButton />
    </div>
  )
}
