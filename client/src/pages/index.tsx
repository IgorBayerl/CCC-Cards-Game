import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import { useGameContext } from '~/components/GameContext'
import Layout from '~/components/Atoms/Layout'
import { ActionIcon, Button, TextInput } from '@mantine/core'
import { IconPlayerPlay, IconReload } from '@tabler/icons-react'
import { TutorialCarousel } from '~/components/Atoms/TutorialCarousel'
import Image from 'next/image'
import { useShuffleArray } from '~/hooks/useShuffleArray'

const profilePictures = [
  '/profile/profile_1.jpg',
  '/profile/profile_2.jpg',
  '/profile/profile_3.jpg',
  '/profile/profile_4.jpg',
]

const IndexPage = () => {
  const { gameState, joinRoom, socket } = useGameContext()
  const [pictureUrl, nextPicture] = useShuffleArray(profilePictures)
  const router = useRouter()

  const [username, setUsername] = useState('')

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
    const username = localStorage.getItem('username') || ''
    setUsername(username)
  }, [])

  const handleCreateRoom = () => {
    const newRoomCode = uuidv4()
    joinRoom(username, newRoomCode, pictureUrl)
  }

  const handleJoinRoom = () => {
    joinRoom(username, roomCode, pictureUrl)
  }

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const username = event.target.value
    setUsername(username)
    localStorage.setItem('username', username)
  }

  const handlePictureUrlChange = () => {
    nextPicture()
  }

  const isJoiningRoom = roomCode && gameState.players.length === 0
  const buttonText = isJoiningRoom ? 'Join Room' : 'Create Room'
  const buttonOnClick = isJoiningRoom ? handleJoinRoom : handleCreateRoom

  const handleButtonClick = () => {
    setIsLoading(true)
    buttonOnClick()
  }

  return (
    <Layout>
      <div className="flex w-full max-w-[80%] flex-col bg-red-200 lg:flex-row">
        <div className="flex aspect-[16/9] flex-1 flex-col items-center justify-center gap-6  p-5 lg:aspect-auto xl:flex-row">
          <div className=" flex justify-center ">
            <div className="relative ">
              <Image
                src={pictureUrl || '/profile_1.jpg'}
                alt="profile_picture"
                className="rounded-full"
                width={200}
                height={200}
              />
              <ActionIcon
                variant="filled"
                color="blue"
                className="absolute bottom-0 right-0"
                onClick={handlePictureUrlChange}
              >
                <IconReload size="1rem" />
              </ActionIcon>
            </div>
          </div>
          <div className="flex w-full flex-1 flex-col gap-3  p-5">
            <TextInput
              label="Username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              maxLength={20}
            />

            <Button
              leftIcon={<IconPlayerPlay size="1rem" />}
              loading={isLoading}
              onClick={handleButtonClick}
            >
              {buttonText}
            </Button>
          </div>
        </div>
        <div className="w-full  p-5 lg:max-w-md xl:max-w-lg ">
          <TutorialCarousel />
        </div>
      </div>
    </Layout>
  )
}

export default IndexPage;
