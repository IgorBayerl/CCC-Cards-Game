import { useGameContext } from '~/components/GameContext'
import PlayersList from '~/components/PlayersList'
import React, { useCallback, useEffect, useState } from 'react'
import router from 'next/router'
import { CopyToClipboard } from '~/components/Atoms/CopyToClipboard'
import ContainerHeader from '~/components/Layout/ContainerHeader'
import { toast } from 'react-toastify'
import { Link, Play } from '@phosphor-icons/react'
import useShare from '~/hooks/useShare'
import classNames from 'classnames'
import LoadingWithText from '~/components/Atoms/LoadingWithText'
import useTranslation from 'next-translate/useTranslation'
import MobilePlayersList from '~/components/MobilePlayersList'
import LoadingFullScreen from '~/components/Atoms/LoadingFullScreen'

import { MessageType } from '@ccc-cards-game/types'
import { ShareQrCode } from '~/components/Atoms/ShareQrCode'
import { Drawer } from '~/components/Atoms/Drawer'
import { DrawerTrigger, DrawerOverlay, DrawerContent, DrawerClose } from '~/components/Atoms/Drawer'
import QRCode from 'react-qr-code'
import LobbySettingsTab from '~/components/Lobby/Settings'
import LobbyDecksTab from '~/components/Lobby/DecksTab'

export default function LobbyPage() {
  const { roomId, gameState, isCurrentUserLeader, gameConfig, leaveRoom, setConfig, sendToRoom } = useGameContext()

  const { t } = useTranslation('lobby')

  const playersList = Array.from(gameState.players.values())

  const roomSize = gameConfig?.roomSize?.toString() || '4'

  const share = useShare()

  const tabsNames = {
    decks_selection_tab: 'i-decks-selection-tab',
    settings_tab: 'i-settings-tab',
  }

  const tabs = Object.keys(tabsNames) as (keyof typeof tabsNames)[]

  const [activeTab, setActiveTab] = useState(tabs[0])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleLeaveRoom = useCallback(() => {
    void router.push('/')
    leaveRoom()
  }, [leaveRoom])

  useEffect(() => {
    if (!roomId) handleLeaveRoom()
  }, [handleLeaveRoom, roomId])

  const handleChangeRoomSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const newSize = parseInt(value)
    setConfig({ ...gameConfig, roomSize: newSize })
  }

  const handleStartGame = () => {
    //verify if there are enough players
    if (playersList.length < 2) {
      const message = t('i-you-need-at-least-2-players-to-start-a-game')
      toast.error(message)
      return
    }

    sendToRoom(MessageType.ADMIN_START, null)
  }

  if (!roomId) {
    return <LoadingFullScreen />
  }

  const roomInviteLink = `${window.location.origin}/?roomId=${roomId}`

  const handleShareClicked = () => {
    const data = {
      title: 'CCC - Cyber Chaos Cards',
      text: t('i-join-my-game'),
      url: roomInviteLink,
    }

    void share(data)
  }

  const renderTabContent = () => {
    if (activeTab === 'decks_selection_tab') {
      return <LobbyDecksTab />
    }
    return <LobbySettingsTab />
  }

  return (
    <div className="min-h-screen-safe flex flex-col justify-between md:justify-center md:p-5">
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger />
        <DrawerOverlay />
        <DrawerContent>
          <DrawerClose />
          <div className=' items-center flex justify-center p-10'>
            <QRCode 
              value={roomInviteLink} 
              bgColor='#ffffff'
              fgColor='#202020'
              style={{ 
                height: "auto", 
                maxWidth: "100%", 
                width: "100%",
                maxHeight: "80vh",
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
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
            <div className="px-2">
              <select
                className="select select-bordered w-full"
                disabled={!isCurrentUserLeader}
                value={roomSize}
                onChange={handleChangeRoomSize}
              >
                {Array.from({ length: 17 }, (_, i) => i + 4).map((i) => (
                  <option className="text-lg" key={i} value={i.toString()}>{`${i} ${t('i-players')}`}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex h-full overflow-clip">
            <div className="hidden flex-col gap-2 p-1 md:flex">
              <select
                className="select select-bordered w-full"
                disabled={!isCurrentUserLeader}
                value={roomSize}
                onChange={handleChangeRoomSize}
              >
                {Array.from({ length: 17 }, (_, i) => i + 4).map((i) => (
                  <option className="text-lg" key={i} value={i.toString()}>{`${i} ${t('i-players')}`}</option>
                ))}
              </select>

              <PlayersList players={playersList} leaderId={gameState.leader} roomSize={parseInt(roomSize)} />
            </div>
            <div className="flex w-full flex-col justify-between ">
              <div role='tablist' className="tabs tabs-bordered md:px-3">
                {tabs.map((tab) => (
                  <a
                    key={tab}
                    className={classNames('tab-bordered tab tab-lg flex-1 whitespace-nowrap  text-white', {
                      'tab-active': activeTab === tab,
                    })}
                    onClick={() => setActiveTab(tab)}
                  >
                    {t(tabsNames[tab])}
                  </a>
                ))}
              </div>

              <div className="bg-destaque-mobile flex-1 overflow-y-clip ">{renderTabContent()}</div>
              {isCurrentUserLeader && (
                <div className="flex justify-center gap-5 px-4 py-2">
                  <div className="hidden flex-1 md:flex gap-1">
                    <CopyToClipboard text={t('i-invite')} content={roomInviteLink} />
                    <ShareQrCode content={roomInviteLink} onOpenDrawer={toggleDrawer} />
                  </div>
                  <div className="flex flex-1 md:hidden gap-1">
                    <button
                      className="btn-outline btn btn-accent flex w-full flex-1 items-center justify-center sm:justify-between gap-3 md:hidden"
                      onClick={handleShareClicked}
                    >
                      <Link size={25} weight="bold" />
                      <div className='hidden sm:block'>{t('i-invite')}</div>
                      <div className='hidden sm:block' />
                    </button>
                    <ShareQrCode content={roomInviteLink} onOpenDrawer={toggleDrawer} />
                  </div>
                  <button
                    className=" btn flex w-full flex-1 flex-nowrap items-center justify-between gap-3 whitespace-nowrap"
                    disabled={!isCurrentUserLeader}
                    onClick={handleStartGame}
                  >
                    <Play size={25} weight="bold" />
                    <div>{t('i-start-game')}</div>
                    <div />
                  </button>
                </div>
              )}
              {!isCurrentUserLeader && <LoadingWithText text={t('i-waiting-the-host-start-the-game')} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

