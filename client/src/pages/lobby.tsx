import { useGameContext } from '~/components/GameContext'
import PlayersList from '~/components/PlayersList'
import React, { useCallback, useEffect, useState } from 'react'
import router from 'next/router'
import { CopyToClipboard } from '~/components/Atoms/CopyToClipboard'
import { useQuery } from 'react-query'
import { fetchDecks, fetchLanguages } from '~/api/deck'
import ContainerHeader from '~/components/Layout/ContainerHeader'
import { toast } from 'react-toastify'
import useSound from 'use-sound'
import { useAudio } from '~/components/AudioContext'
import { Globe, Link, Play, Timer, Trophy } from '@phosphor-icons/react'
import useShare from '~/hooks/useShare'
import classNames from 'classnames'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import LoadingWithText from '~/components/Atoms/LoadingWithText'
import useTranslation from 'next-translate/useTranslation'
import MobilePlayersList from '~/components/MobilePlayersList'
import LoadingFullScreen from '~/components/Atoms/LoadingFullScreen'

import { toggleInArray } from '~/lib/utils'
import { MessageType, type Deck } from '@ccc-cards-game/types'

export default function LobbyPage() {
  const { roomId, gameState, isCurrentUserLeader, gameConfig, leaveRoom, setConfig, sendToRoom } = useGameContext()

  const { t } = useTranslation('lobby')

  const playersList = Array.from(gameState.players.values())

  const roomSize = gameConfig?.roomSize?.toString() || '4'

  // TODO: change this to a getStaticProps with revalidate of 1 hour
  const share = useShare()

  // const tabs = ['decks_selection_tab', 'settings_tab']

  const tabsNames = {
    decks_selection_tab: 'i-decks-selection-tab',
    settings_tab: 'i-settings-tab',
  }

  const tabs = Object.keys(tabsNames) as (keyof typeof tabsNames)[]

  const [activeTab, setActiveTab] = useState(tabs[0])

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
    switch (activeTab) {
      case 'decks_selection_tab':
        return <LobbyDecksTab />
      case 'settings_tab':
        return <LobbySettingsTab />
      default:
        return <LobbyDecksTab />
    }
  }

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
              <div className="tabs md:px-3">
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
                  <div className="hidden flex-1 md:flex">
                    <CopyToClipboard text={t('i-invite')} content={roomInviteLink} />
                  </div>
                  <div className="flex flex-1 md:hidden">
                    <button
                      className="btn-outline btn btn-accent flex w-full flex-1 items-center justify-between gap-3 md:hidden"
                      onClick={handleShareClicked}
                    >
                      <Link size={25} weight="bold" />
                      <div>{t('i-invite')}</div>
                      <div />
                    </button>
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

function LobbySettingsTab() {
  const { t } = useTranslation('lobby')
  const { gameConfig, setConfig, isCurrentUserLeader } = useGameContext()

  const handleChangeScoreToWin = (value: string) => {
    const newScoreToWin = parseInt(value)
    setConfig({ ...gameConfig, scoreToWin: newScoreToWin })
  }

  const handleChangeTimeToPlay = (value: string) => {
    const newTimeToPlay = parseInt(value)
    setConfig({ ...gameConfig, roundTime: newTimeToPlay })
  }

  const scoreToWin = gameConfig?.scoreToWin?.toString() || '10'
  const timeToPlay = gameConfig?.roundTime?.toString() || '60'

  return (
    <div className="flex h-full flex-col overflow-y-auto px-2 pt-2 md:px-3">
      <div className="flex flex-col gap-2">
        <label htmlFor="score-to-win" className="flex gap-3 text-white">
          <Trophy size={24} weight="bold" />
          {t('i-score-to-win')}
        </label>
        <select
          className="select select-bordered"
          id="score-to-win"
          onChange={(e) => handleChangeScoreToWin(e.target.value)}
          disabled={!isCurrentUserLeader}
          value={scoreToWin}
        >
          {Array.from({ length: 17 }, (_, i) => i + 4).map((i) => (
            <option className="text-lg" key={i} value={i.toString()}>
              {`${i} ${t('i-points')}`}
            </option>
          ))}
        </select>
      </div>
      <div className="divider" />
      <div className="flex flex-col gap-2">
        <label htmlFor="score-to-win" className="flex gap-3 text-white">
          <Timer size={24} weight="bold" />
          {t('i-time')}
        </label>
        <select
          className="select select-bordered"
          id="score-to-win"
          onChange={(e) => handleChangeTimeToPlay(e.target.value)}
          disabled={!isCurrentUserLeader}
          value={timeToPlay}
        >
          {Array.from({ length: 6 }, (_, i) => (i + 1) * 10).map((i) => (
            <option className="text-lg" key={`${i}_seconds`} value={i.toString()}>{`${i} ${t('i-seconds')}`}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

// Reusable Components
// TODO: remove this any
const FilterLabel = ({ length, label }: { length: number; label: string }) => (
  <span className="flex gap-2">
    <span>{length > 0 ? `${length} Selected` : label}</span>
  </span>
)

const queryConfig = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
}

function LobbyDecksTab() {
  // Localization and Context
  const { t } = useTranslation('lobby')
  const { gameConfig, setConfig, isCurrentUserLeader } = useGameContext()
  const { isMuted } = useAudio()

  // Sounds
  const [playSwitchOn] = useSound('/sounds/switch-on.mp3')
  const [playSwitchOff] = useSound('/sounds/switch-off.mp3')

  // States
  const [selectedDarknessLevels, setSelectedDarknessLevels] = useState([1, 2, 3])
  const [selectedLanguages, setSelectedLanguages] = useState(['pt'])
  const [isModalCategoryOpen, setIsModalCategoryOpen] = useState(false)
  const [isModalLanguageOpen, setIsModalLanguageOpen] = useState(false)

  // const initialFilters: DeckFilters = {
  //   darknessLevel: [1, 2, 3],
  //   language: ['pt'],
  //   title: '',
  // }

  const fetchDecksWithFilters = () =>
    fetchDecks({
      language: selectedLanguages,
      darknessLevel: selectedDarknessLevels,
      title: '',
    })

  const decksResponse = useQuery(
    ['get-decks', selectedLanguages, selectedDarknessLevels],
    () => fetchDecksWithFilters(),
    queryConfig
  )

  const languagesResponse = useQuery('get-languages', fetchLanguages, queryConfig)

  const categoriesMock = [
    {
      id: 1,
      name: t('i-family-friendly'),
    },
    {
      id: 2,
      name: t('i-safe-for-stream'),
    },
    {
      id: 3,
      name: t('i-mature-humor'),
    },
    {
      id: 4,
      name: t('i-chaos'),
    },
    {
      id: 5,
      name: t('i-uncensored-raw'),
    },
  ]

  // Handlers
  const toggleDarknessLevel = (level: number) => {
    setSelectedDarknessLevels((prevLevels) => toggleInArray(prevLevels, level))
  }

  const toggleLanguageSelection = (language: string) => {
    setSelectedLanguages((prevLanguages) => toggleInArray(prevLanguages, language))
  }

  const handleDeckChange = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const { checked } = event.target

    if (!isMuted) checked ? playSwitchOn() : playSwitchOff()

    let newSelectedDecks: Deck[] = [] //TODO fix this types
    if (checked) {
      // deck to add is the deck with the id passed as argument
      const deckToAdd = decksData.find((deck) => deck.id === id)

      // if the deck is not found, log an error and return
      if (!deckToAdd) return console.error(`Deck not found with id ${id}`)

      newSelectedDecks = [...gameConfig.availableDecks, deckToAdd] //TODO fix this types
    } else {
      newSelectedDecks = gameConfig.availableDecks.filter((deck) => deck.id !== id)
    }

    setConfig({ ...gameConfig, availableDecks: newSelectedDecks })
  }

  if (decksResponse.isLoading || languagesResponse.isLoading) {
    return <LoadingFullScreen />
  }

  if (decksResponse.isError || !decksResponse.data || languagesResponse.isError || !languagesResponse.data) {
    return <div>Something went wrong!</div>
  }

  const decksData = decksResponse.data.data.decks
  const languagesData = languagesResponse.data

  const decksList: Deck[] = isCurrentUserLeader
    ? decksData.map((deck) => ({
        ...deck,
        selected: gameConfig.availableDecks.some((selectedDeck) => selectedDeck.id === deck.id),
      }))
    : gameConfig.availableDecks.map((deck) => ({
        ...deck,
        selected: true,
      }))

  return (
    <div className="flex h-full flex-col px-2 pt-2 md:px-0">
      {isCurrentUserLeader && (
        <div className="flex gap-3 rounded-md bg-white bg-opacity-20 p-2 md:mx-3">
          <label htmlFor="modal-language" className="btn-outline btn btn-accent justify-between gap-2">
            <Globe size={25} weight="bold" />
            <FilterLabel length={selectedLanguages.length} label="All" />
          </label>
          <label htmlFor="modal-category" className="btn-outline btn btn-accent flex-1">
            <FilterLabel length={selectedDarknessLevels.length} label="All Categories" />
          </label>
        </div>
      )}

      {isCurrentUserLeader && <div className="divider mx-3 my-0" />}
      <div className="flex flex-col gap-2 overflow-y-auto bg-opacity-50 text-accent scrollbar-none md:px-3">
        <AnimatePresence mode="popLayout">
          {decksList.map((deck) => (
            <React.Fragment key={`${deck.id}_deck`}>
              <input
                id={`${deck.id}_deck`}
                type="checkbox"
                onChange={(e) => handleDeckChange(e, deck.id)}
                checked={deck.selected}
                className="hidden"
                disabled={!isCurrentUserLeader}
              />
              <motion.label
                htmlFor={`${deck.id}_deck`}
                className={classNames(
                  'flex h-auto flex-nowrap items-center justify-between gap-2 border-2 py-2 pl-2 text-left normal-case',
                  {
                    'btn btn-ghost': isCurrentUserLeader,
                    'btn btn-disabled btn-active btn-ghost text-accent': !isCurrentUserLeader,
                    'border-white hover:border-white': deck.selected,
                    'border-transparent': !deck.selected,
                  }
                )}
              >
                <div className="flex items-center gap-3">
                  <Image
                    // src={deck.icon}
                    src="/icon_dark.png"
                    alt={deck.title}
                    width={100}
                    height={100}
                    className="aspect-square h-16 w-16 rounded-xl bg-neutral bg-opacity-70 object-contain"
                  />
                  <div className="truncate">
                    <h1 className="card-title ">{deck.title}</h1>
                    <p className="text-sm">{deck.description}</p>
                  </div>
                </div>
                <div className="uppercase">{deck.language}</div>
              </motion.label>
              <div className="divider mx-auto my-0 w-32" />
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>
      <input
        type="checkbox"
        id="modal-category"
        className="modal-toggle"
        checked={isModalCategoryOpen}
        onChange={() => setIsModalCategoryOpen(!isModalCategoryOpen)}
      />
      <label htmlFor="modal-category" className="modal">
        <label className="modal-box relative py-10" htmlFor="">
          <label htmlFor="modal-category" className="btn btn-circle btn-sm absolute right-2 top-2">
            ✕
          </label>
          <h1 className="card-title py-4">{t('i-how-bad-will-the-cards-be')}</h1>
          <ul className="flex flex-col gap-3">
            {categoriesMock.map((darknessLevel) => (
              <label
                htmlFor={String(darknessLevel.id)}
                className={`btn ${
                  selectedDarknessLevels.includes(darknessLevel.id)
                    ? ''
                    : 'btn-neutral btn-outline hover:bg-neutral hover:bg-opacity-20 hover:text-neutral'
                } flex gap-3`}
                key={darknessLevel.id}
              >
                <input
                  type="checkbox"
                  name=""
                  id={String(darknessLevel.id)}
                  className="hidden"
                  checked={selectedDarknessLevels.includes(darknessLevel.id)}
                  onChange={() => toggleDarknessLevel(darknessLevel.id)}
                />
                <label htmlFor={String(darknessLevel.id)}>{darknessLevel.name}</label>
              </label>
            ))}
          </ul>
        </label>
      </label>

      <input
        type="checkbox"
        id="modal-language"
        className="modal-toggle"
        checked={isModalLanguageOpen}
        onChange={() => setIsModalLanguageOpen(!isModalLanguageOpen)}
      />
      <label htmlFor="modal-language" className="modal">
        <label className="modal-box relative py-10" htmlFor="">
          <label htmlFor="modal-language" className="btn btn-circle btn-sm absolute right-2 top-2">
            ✕
          </label>
          <h1 className="card-title py-4">{t('i-filter-by-language')}</h1>
          <ul className="flex flex-col gap-3">
            {languagesData.map((language) => (
              <label
                htmlFor={language}
                className={`btn ${
                  selectedLanguages.includes(language)
                    ? ''
                    : 'btn-neutral btn-outline hover:bg-neutral hover:bg-opacity-20 hover:text-neutral'
                } flex gap-3`}
                key={language}
              >
                <input
                  type="checkbox"
                  name=""
                  id={language}
                  className="hidden"
                  checked={selectedLanguages.includes(language)}
                  onChange={() => toggleLanguageSelection(language)}
                />
                <label htmlFor={language}>{language}</label>
              </label>
            ))}
          </ul>
        </label>
      </label>
    </div>
  )
}
