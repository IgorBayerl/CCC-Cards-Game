import MuteButton from '../Atoms/MuteButton'
import { useGameContext } from '../GameContext'
import Image from 'next/image'
import router from 'next/router'
import { SignOut } from '@phosphor-icons/react'
import CCCIconThemed from '../Atoms/CCCIconThemed'
import useTranslation from 'next-translate/useTranslation'

export default function ContainerHeader() {
  const { t } = useTranslation('common')
  const { leaveRoom } = useGameContext()

  const handleLeaveRoom = () => {
    void router.push('/')
    leaveRoom()
  }

  return (
    <div className="hidden w-full items-center justify-between md:flex">
      <button className="btn-outline btn " onClick={handleLeaveRoom}>
        <SignOut size={25} weight="bold" />
        {t('i-back-text')}
      </button>
      <CCCIconThemed />
      <MuteButton />
    </div>
  )
}
