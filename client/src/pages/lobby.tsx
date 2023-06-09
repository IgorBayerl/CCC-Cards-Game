import { useGameContext } from '~/components/GameContext'
import PlayersList from '~/components/PlayersList'
import React, { useEffect, useState } from 'react'
import router from 'next/router'
import { CopyToClipboard } from '~/components/Atoms/CopyToClipboard'
import { useQuery } from 'react-query'
import { getDecks } from '~/api/deck'
import { type IDeckConfigScreen } from '~/models/Deck'
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
import BannerVertical from '~/components/Ads/BannerVertical'

const languagesMock = [
  // { id: 'en', name: 'English' },
  { id: 'pt', name: 'Portuguese' },
  // { id: 'es', name: 'Spanish' },
]

export default function LobbyPage() {
  const {
    roomId,
    gameState,
    isCurrentUserLeader,
    gameConfig,
    leaveRoom,
    setConfig,
    admCommand,
  } = useGameContext()

  const { t } = useTranslation('lobby')

  const playersList = gameState.players
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

  const handleLeaveRoom = () => {
    void router.push('/')
    leaveRoom()
  }

  useEffect(() => {
    if (!roomId) handleLeaveRoom()
  }, [roomId])

  const handleChangeRoomSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const newSize = parseInt(value)
    setConfig({ ...gameConfig, roomSize: newSize })
  }

  const handleStartGame = () => {
    //verify if there are enough players
    if (gameState.players.length < 2) {
      const message = t('i-you-need-at-least-2-players-to-start-a-game')
      toast.error(message)
      return
    }

    admCommand('start')
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
              <MobilePlayersList
                players={playersList}
                leader={gameState.leader}
                roomSize={parseInt(roomSize)}
              />
            </div>
            <div className="px-2">
              <select
                className="select-bordered select w-full"
                disabled={!isCurrentUserLeader}
                value={roomSize}
                onChange={handleChangeRoomSize}
              >
                {Array.from({ length: 17 }, (_, i) => i + 4).map((i) => (
                  <option
                    className="text-lg"
                    key={i}
                    value={i.toString()}
                  >{`${i} ${t('i-players')}`}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex h-full overflow-clip">
            <div className="hidden flex-col gap-2 p-1 md:flex">
              <select
                className="select-bordered select w-full"
                disabled={!isCurrentUserLeader}
                value={roomSize}
                onChange={handleChangeRoomSize}
              >
                {Array.from({ length: 17 }, (_, i) => i + 4).map((i) => (
                  <option
                    className="text-lg"
                    key={i}
                    value={i.toString()}
                  >{`${i} ${t('i-players')}`}</option>
                ))}
              </select>

              <PlayersList
                players={playersList}
                leader={gameState.leader}
                roomSize={parseInt(roomSize)}
              />
            </div>
            <div className="flex w-full flex-col justify-between ">
              <div className="tabs md:px-3">
                {tabs.map((tab) => (
                  <a
                    key={tab}
                    className={classNames(
                      'tab-bordered tab tab-lg flex-1 whitespace-nowrap  text-white',
                      {
                        'tab-active': activeTab === tab,
                      }
                    )}
                    onClick={() => setActiveTab(tab)}
                  >
                    {t(tabsNames[tab])}
                  </a>
                ))}
              </div>

              <div className="bg-destaque-mobile flex-1 overflow-y-clip ">
                {renderTabContent()}
              </div>
              {isCurrentUserLeader && (
                <div className="flex justify-center gap-5 px-4 py-2">
                  <div className="hidden flex-1 md:flex">
                    <CopyToClipboard
                      text={t('i-invite')}
                      content={roomInviteLink}
                    />
                  </div>
                  <div className="flex flex-1 md:hidden">
                    <button
                      className="btn-outline btn-accent btn flex w-full flex-1 items-center justify-between gap-3 md:hidden"
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
              {!isCurrentUserLeader && (
                <LoadingWithText
                  text={t('i-waiting-the-host-start-the-game')}
                />
              )}
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
    setConfig({ ...gameConfig, time: newTimeToPlay })
  }

  const scoreToWin = gameConfig?.scoreToWin?.toString() || '10'
  const timeToPlay = gameConfig?.time?.toString() || '60'

  return (
    <div className="flex h-full flex-col overflow-y-auto px-2 pt-2 md:px-3">
      <div className="flex flex-col gap-2">
        <label htmlFor="score-to-win" className="flex gap-3 text-white">
          <Trophy size={24} weight="bold" />
          {t('i-score-to-win')}
        </label>
        <select
          className="select-bordered select"
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
          className="select-bordered select"
          id="score-to-win"
          onChange={(e) => handleChangeTimeToPlay(e.target.value)}
          disabled={!isCurrentUserLeader}
          value={timeToPlay}
        >
          {Array.from({ length: 6 }, (_, i) => (i + 1) * 10).map((i) => (
            <option
              className="text-lg"
              key={`${i}_seconds`}
              value={i.toString()}
            >{`${i} ${t('i-seconds')}`}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

interface ICategory {
  id: number
  name: string
}

interface ILanguage {
  id: string
  name: string
}

function LobbyDecksTab() {
  const { t } = useTranslation('lobby')

  const categoriesMock = [
    {
      id: 0,
      name: t('i-family-friendly'),
    },
    {
      id: 1,
      name: t('i-safe-for-stream'),
    },
    {
      id: 2,
      name: t('i-mature-humor'),
    },
    {
      id: 3,
      name: t('i-chaos'),
    },
    {
      id: 4,
      name: t('i-uncensored-raw'),
    },
  ]

  const { gameConfig, setConfig, isCurrentUserLeader } = useGameContext()
  const { isMuted } = useAudio()

  const [playSwitchOn] = useSound('/sounds/switch-on.mp3')
  const [playSwitchOff] = useSound('/sounds/switch-off.mp3')

  const defaultLanguage =
    languagesMock.find((language) => language.id === router.locale) || {
      id: 'pt',
      name: 'Português',
    } ||
    null //TODO: Remove this default language in the future

  const defaultCategory =
    categoriesMock.find((category) => category.id === 1) || null

  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    defaultCategory
  )
  const [isModalCategoryOpen, setIsModalCategoryOpen] = useState<boolean>(false)

  const [selectedLanguage, setSelectedLanguage] = useState<ILanguage | null>(
    defaultLanguage
  )
  const [isModalLanguageOpen, setIsModalLanguageOpen] = useState<boolean>(false)

  const decksResponse = useQuery(
    ['get-decks', selectedLanguage, selectedCategory],
    () =>
      getDecks({
        language: selectedLanguage?.id,
        category: selectedCategory?.id,
      })
  )

  const toggleCategorySelection = (category: ICategory) => {
    if (selectedCategory && selectedCategory.id === category.id) {
      setSelectedCategory(null)
    } else {
      setSelectedCategory(category)
    }
    setIsModalCategoryOpen(false)
  }

  const toggleLanguageSelection = (language: ILanguage) => {
    if (selectedLanguage && selectedLanguage.id === language.id) {
      setSelectedLanguage(null)
    } else {
      setSelectedLanguage(language)
    }
    setIsModalLanguageOpen(false)
  }

  if (decksResponse.isLoading) {
    return <LoadingFullScreen />
  }

  if (decksResponse.isError || !decksResponse.data) {
    return <div>Something went wrong!</div>
  }

  const decksData = decksResponse.data

  const handleDeckChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const { checked } = event.target

    if (!isMuted) checked ? playSwitchOn() : playSwitchOff()

    let newSelectedDecks: IDeckConfigScreen[] = []
    if (checked) {
      const deckToAdd = decksData.find((deck) => deck.id === id)
      if (!deckToAdd) return console.error(`Deck not found with id ${id}`)
      newSelectedDecks = [...gameConfig.decks, deckToAdd]
    } else {
      newSelectedDecks = gameConfig.decks.filter((deck) => deck.id !== id)
    }

    setConfig({ ...gameConfig, decks: newSelectedDecks })
  }

  const decksList: IDeckConfigScreen[] = isCurrentUserLeader
    ? decksData.map((deck) => ({
        ...deck,
        selected: gameConfig.decks.some(
          (selectedDeck) => selectedDeck.id === deck.id
        ),
      }))
    : gameConfig.decks.map((deck) => ({
        ...deck,
        selected: true,
      }))

  return (
    <div className="flex h-full flex-col px-2 pt-2 md:px-0">
      {isCurrentUserLeader && (
        <div className="flex gap-3 rounded-md bg-white bg-opacity-20 p-2 md:mx-3">
          <label
            htmlFor="modal-language"
            className="btn-outline btn-accent btn justify-between gap-2"
          >
            <Globe size={25} weight="bold" /> {selectedLanguage?.id || 'All'}
            <div />
          </label>
          <label
            htmlFor="modal-category"
            className="btn-outline btn-accent btn flex-1"
          >
            {selectedCategory ? (
              <span className="flex gap-2">
                <span>{selectedCategory.name}</span>
              </span>
            ) : (
              <span className="flex gap-2">All Categories</span>
            )}
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
                    'btn-ghost btn': isCurrentUserLeader,
                    'btn-disabled btn-ghost btn-active btn text-accent':
                      !isCurrentUserLeader,
                    'border-white hover:border-white': deck.selected,
                    'border-transparent': !deck.selected,
                  }
                )}
              >
                <div className="flex items-center gap-3">
                  <Image
                    // src={deck.icon}
                    src="/icon_dark.png"
                    alt={deck.name}
                    width={100}
                    height={100}
                    className="aspect-square h-16 w-16 rounded-xl bg-neutral bg-opacity-70 object-contain"
                  />
                  <div className="truncate">
                    <h1 className="card-title ">{deck.name}</h1>
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
          <label
            htmlFor="modal-category"
            className="btn-sm btn-circle btn absolute right-2 top-2"
          >
            ✕
          </label>
          <h1 className="card-title py-4">
            {t('i-how-bad-will-the-cards-be')}
          </h1>
          <ul className="flex flex-col gap-3">
            {categoriesMock.map((category) => (
              <label
                htmlFor={String(category.id)}
                className={`btn ${
                  selectedCategory && selectedCategory.id === category.id
                    ? ''
                    : 'btn-neutral btn-outline'
                } flex gap-3`}
                key={category.id}
              >
                <input
                  type="checkbox"
                  name=""
                  id={String(category.id)}
                  className="hidden"
                  checked={
                    !!(selectedCategory && selectedCategory.id === category.id)
                  }
                  onChange={() => toggleCategorySelection(category)}
                />
                <label htmlFor={String(category.id)}>{category.name}</label>
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
          <label
            htmlFor="modal-language"
            className="btn-sm btn-circle btn absolute right-2 top-2"
          >
            ✕
          </label>
          <h1 className="card-title py-4">{t('i-filter-by-language')}</h1>
          <ul className="flex flex-col gap-3">
            {languagesMock.map((language) => (
              <label
                htmlFor={language.id}
                className={`btn ${
                  selectedLanguage && selectedLanguage.id === language.id
                    ? ''
                    : 'btn-outline'
                } flex gap-3`}
                key={language.id}
              >
                <input
                  type="checkbox"
                  name=""
                  id={language.id}
                  className="hidden"
                  checked={
                    !!(selectedLanguage && selectedLanguage.id === language.id)
                  }
                  onChange={() => toggleLanguageSelection(language)}
                />
                <label htmlFor={language.id}>{language.name}</label>
              </label>
            ))}
          </ul>
        </label>
      </label>
    </div>
  )
}
