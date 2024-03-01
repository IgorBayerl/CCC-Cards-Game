import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useGameContext } from '~/components/GameContext'
import Image from 'next/image'
import { useShuffleArray } from '~/hooks/useShuffleArray'
import useTranslation from 'next-translate/useTranslation'
import {
  ArrowClockwise,
  Play,
} from '@phosphor-icons/react'
import Link from 'next/link'
import InfoPageLayout from '~/components/Layout/InfoPageLayout'

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
  '/profile/profile_11.webp',
]

export default function Home() {
  const router = useRouter()

  const { t } = useTranslation('common')
  const playText = t('i-join')
  const createRoomText = t('i-create-room')

  const instructionText = t('i-select-picture-and-nickname')
  const nicknameText = t('i-nickname')

  const termsOfServiceText = t('i-terms-of-service')
  const privacyText = t('i-privacy-policy')
  const contactText = t('i-contact')
  const homeText = t('i-home')

  const selectYourLanguageText = t('i-select-your-language')

  const { gameState, createRoom, joinRoom } = useGameContext()
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
    handleGenerateFallbackUsername()
    const username = localStorage.getItem('username') || ''
    setUsername(username)
  }, [])

  const getName = () => {
    return username.trim() || fallbackUsername.trim()
  }

  const handleCreateRoom = () => {
    createRoom(getName(), pictureUrl)
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

  const isJoiningRoom =
    roomCode && Object.values(gameState.players).length === 0
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
    <>
      <InfoPageLayout>
        <div className="gap-5 py-10 md:flex flex-1">
          <div className="w-full gap-5 md:flex  md:rounded-xl md:p-5 lg:flex lg:flex-row">
            <div className="flex justify-center">
              <div className=" flex items-center justify-center">
                <div className="relative aspect-square rounded-full border-4 border-gray-200 shadow-lg">
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
                    className="btn-accent btn-circle btn absolute bottom-0 right-0 text-neutral"
                    onClick={handlePictureUrlChange}
                  >
                    <ArrowClockwise size={25} weight="bold" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-1 flex-col justify-center gap-3 ">
              <div className="form-control w-full text-2xl text-white">
                <label className="label font-bold">{instructionText}</label>
                <label className="label">
                  <span className="label-text text-gray-200">
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
                className="btn hidden items-center text-white  md:flex"
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
          {/* <div className=" hidden aspect-[8/10] border-gray-200 p-2 md:h-full md:w-1/3 md:rounded-xl md:border-2 lg:block lg:h-96 lg:w-auto">
            <TutorialCarousel />
          </div> */}
        </div>
        <div className="flex flex-col overflow-clip">
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
          {/* <BannerHorizontal /> */}
        </div>
      </InfoPageLayout>
    </>
  )
}
