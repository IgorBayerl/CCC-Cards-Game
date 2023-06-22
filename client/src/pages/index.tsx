import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { v4 as uuidv4 } from 'uuid'
import { useGameContext } from '~/components/GameContext'
import { TutorialCarousel } from '~/components/Atoms/TutorialCarousel'
import Image from 'next/image'
import { useShuffleArray } from '~/hooks/useShuffleArray'
import useTranslation from 'next-translate/useTranslation'
import {
  ArrowClockwise,
  DiscordLogo,
  DotsThree,
  Globe,
  Info,
  Play,
} from '@phosphor-icons/react'
import CCCIconThemed from '~/components/Atoms/CCCIconThemed'
import Link from 'next/link'
import Footer from '~/components/Footer'
import BannerVertical from '~/components/Ads/Banner_160x600'
import BannerHorizontal from '~/components/Ads/Banner_468x60'

const profilePictures = [
  '/profile/profile_1.webp',
  '/profile/profile_2.webp',
  '/profile/profile_3.webp',
  '/profile/profile_4.webp',
  '/profile/profile_5.webp',
  '/profile/profile_6.webp',
  '/profile/profile_7.webp',
  '/profile/profile_8.webp',
  '/profile/profile_9.webp',
  '/profile/profile_10.webp',
]

export default function Home() {
  const router = useRouter()

  const { t } = useTranslation('common')
  const playText = t('i-join')
  const createRoomText = t('i-create-room')

  const instructionText = t('i-select-picture-and-nickname')
  const nicknameText = t('i-nickname')

  const selectYourLanguageText = t('i-select-your-language')

  const { gameState, joinRoom, socket } = useGameContext()
  const [pictureUrl, nextPicture] = useShuffleArray(profilePictures)

  const [username, setUsername] = useState('')
  const [fallbackUsername, setFallbackUsername] = useState('')

  const [roomCode, setRoomCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const roomId = router.query.roomId
    if (roomId) {
      setRoomCode(roomId.toString())
    }
  }, [router.query.roomId])

  useEffect(() => {
    socket?.on('join:error', () => {
      setIsLoading(false)
    })
    return () => {
      socket?.off('join:error')
    }
  }, [socket])

  useEffect(() => {
    handleGenerateFallbackUsername()
    const username = localStorage.getItem('username') || ''
    setUsername(username)
  }, [])

  const getName = () => {
    return username.trim() || fallbackUsername.trim()
  }

  const handleCreateRoom = () => {
    const newRoomCode = uuidv4()
    joinRoom(getName(), newRoomCode, pictureUrl)
  }

  const handleJoinRoom = () => {
    joinRoom(getName(), roomCode, pictureUrl)
  }

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const username = event.target.value

    setUsername(username)
    localStorage.setItem('username', username)
  }

  /**
   * The function generates a random username with the following format:
   * CoolNickname + 4 random characters
   */
  const handleGenerateFallbackUsername = () => {
    const coolNameText = t('i-cool-nickname')
    const randomString = Math.random().toString().slice(-4).toUpperCase()
    const randomUsername = `${coolNameText}${randomString}`
    setFallbackUsername(randomUsername)
  }

  const handlePictureUrlChange = () => {
    nextPicture()
  }

  const isJoiningRoom = roomCode && gameState.players.length === 0
  const buttonText = isJoiningRoom ? playText : createRoomText
  const buttonOnClick = isJoiningRoom ? handleJoinRoom : handleCreateRoom

  const handleButtonClick = () => {
    setIsLoading(true)
    buttonOnClick()

    setTimeout(() => {
      setIsLoading(false)
    }, 5000)
  }

  return (
    <div className="min-h-screen-safe flex flex-col justify-between px-5 py-5 text-gray-800 md:justify-center">
      <header className="flex justify-between md:hidden">
        <label htmlFor="my-modal-1" className="btn">
          <DotsThree size={25} weight="bold" />
        </label>
        <CCCIconThemed />
        <label htmlFor="my-modal-2" className="btn">
          <Info size={25} weight="bold" />
        </label>
      </header>
      <div className="flex items-center justify-center">
        <BannerVertical />
        <div className="game-container-border flex flex-col gap-3">
          <div className="hidden w-full items-center justify-between md:flex">
            <label
              htmlFor="my-modal-language"
              className="btn-outline btn flex gap-2 font-bold"
            >
              <Globe size={25} weight="bold" /> {router.locale}
            </label>
            <CCCIconThemed />
            <Link
              className="btn-outline btn"
              href="https://discord.gg/eZsFkPuADE"
              target="_blank"
            >
              <DiscordLogo size={25} weight="bold" />
            </Link>
          </div>
          <div className="gap-5 py-10 md:flex">
            <div className="w-full gap-5 md:flex  md:rounded-xl md:bg-white md:bg-opacity-50 md:p-5 lg:flex lg:flex-row">
              <div className="flex justify-center">
                {profilePictures.map((picture, index) => {
                  return (
                    <div className="hidden" key={index}>
                      <Image
                        src={picture}
                        alt="Profile Picture"
                        width={200}
                        height={200}
                      />
                    </div>
                  )
                })}
                <div className=" flex items-center justify-center ">
                  <div className="relative aspect-square rounded-full border-4 border-neutral shadow-lg   ">
                    <Image
                      src={pictureUrl || '/profile_1.jpg'}
                      alt="profile_picture"
                      className="aspect-square rounded-full"
                      width={200}
                      height={200}
                    />
                    <button
                      name="change-picture"
                      title="Change picture"
                      className="btn-circle btn absolute bottom-0 right-0 "
                      onClick={handlePictureUrlChange}
                    >
                      <ArrowClockwise size={25} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-1 flex-col justify-center gap-3 ">
                <div className="form-control w-full text-2xl">
                  <label className="label font-bold">{instructionText}</label>
                  <label className="label">
                    <span className="label-text text-black">
                      {nicknameText}
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder={fallbackUsername}
                    className="tex-white input-bordered input w-full bg-black bg-opacity-20 text-lg font-bold text-white placeholder-gray-100 focus:bg-opacity-30 "
                    value={username}
                    onChange={handleUsernameChange}
                    maxLength={20}
                  />
                </div>

                <button
                  className="btn hidden items-center md:flex "
                  disabled={isLoading}
                  onClick={handleButtonClick}
                >
                  <Play size={25} weight="bold" />
                  <div className="flex flex-1 items-center justify-center">
                    {buttonText}
                  </div>
                </button>
              </div>
            </div>
            <div className=" hidden aspect-[8/10] border-gray-200 p-2 md:h-full md:w-1/3 md:rounded-xl md:border-2 lg:block lg:h-96 lg:w-auto">
              {/* <TutorialCarousel /> */}
            </div>
          </div>
          <Footer />
        </div>
      </div>
      <div className="flex">
        <button
          className="btn my-5 w-full md:hidden"
          disabled={isLoading}
          onClick={handleButtonClick}
        >
          <Play size={25} weight="bold" />
          <div className="flex flex-1 items-center justify-center">
            {buttonText}
          </div>
        </button>
      </div>
      <input type="checkbox" id="my-modal-1" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative">
          <label
            htmlFor="my-modal-1"
            className="btn-sm btn-circle btn absolute right-2 top-2"
          >
            ✕
          </label>
          <h3 className="text-lg font-bold">Modal 1</h3>
          <p className="py-4">
            {`You've been selected for a chance to get one year of subscription to
            use Wikipedia for free!`}
          </p>
        </div>
      </div>
      <input type="checkbox" id="my-modal-2" className="modal-toggle" />
      <label htmlFor="my-modal-2" className="modal">
        <label className="modal-box relative py-10" htmlFor="">
          <label
            htmlFor="my-modal-2"
            className="btn-sm btn-circle btn absolute right-2 top-2"
          >
            ✕
          </label>
          <div className="py-4">
            <TutorialCarousel />
          </div>
        </label>
      </label>
      <input type="checkbox" id="my-modal-language" className="modal-toggle" />
      <label htmlFor="my-modal-language" className="modal">
        <label className="modal-box relative py-10" htmlFor="">
          <label
            htmlFor="my-modal-language"
            className="btn-sm btn-circle btn absolute right-2 top-2"
          >
            ✕
          </label>
          <h1 className="card-title py-4">{selectYourLanguageText}</h1>
          <ul className="flex flex-col gap-3">
            {router.locales &&
              router.locales.map((locale) => (
                <li key={locale}>
                  <Link href={router.asPath} locale={locale}>
                    <button className="btn-outline btn w-full">{locale}</button>
                  </Link>
                </li>
              ))}
          </ul>
        </label>
      </label>
    </div>
  )
}
