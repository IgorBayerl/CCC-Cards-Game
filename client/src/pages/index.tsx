import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import { useGameContext } from '~/components/GameContext'
import Layout from '~/components/Atoms/Layout'
import { Button, TextInput } from '@mantine/core'
import { IconPlayerPlay } from '@tabler/icons-react'
import { TutorialCarousel } from '~/components/Atoms/TutorialCarousel'

const IndexPage = () => {
  const { gameState, joinRoom } = useGameContext()
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
    const username = localStorage.getItem('username') || ''
    setUsername(username)
  }, [])

  const handleCreateRoom = () => {
    const newRoomCode = uuidv4()
    joinRoom(username, newRoomCode)
  }

  const handleJoinRoom = () => {
    joinRoom(username, roomCode)
  }

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const username = event.target.value
    setUsername(username)
    localStorage.setItem('username', username)
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
        <div className="flex aspect-[16/9] flex-1 flex-col justify-center  gap-3 p-5 lg:aspect-auto">
          <TextInput
            label="Username"
            type="text"
            value={username}
            onChange={handleUsernameChange}
          />

          <Button
            leftIcon={<IconPlayerPlay size="1rem" />}
            loading={isLoading}
            onClick={handleButtonClick}
          >
            {buttonText}
          </Button>
        </div>
        <div className="w-full  p-5 lg:max-w-md xl:max-w-lg ">
          <TutorialCarousel />
        </div>
      </div>
    </Layout>
  )
}

export default IndexPage;
