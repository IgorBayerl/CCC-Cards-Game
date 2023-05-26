import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import { useGameContext } from '~/components/GameContext'
import Layout from '~/components/Layout/Layout'
import { ActionIcon, Button, createStyles, TextInput } from '@mantine/core'
import { IconPlayerPlay, IconReload } from '@tabler/icons-react'
import { TutorialCarousel } from '~/components/Atoms/TutorialCarousel'
import Image from 'next/image'
import { useShuffleArray } from '~/hooks/useShuffleArray'

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

const useStyles = createStyles((theme) => ({
  containerCard: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[5]
        : theme.colors.gray[2],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    display: 'flex',
    width: '100%',
    maxWidth: '80%',
    flexDirection: 'row',
    gap: theme.spacing.md,
    [theme.fn.smallerThan('md')]: {
      flexDirection: 'column',
    },
    [theme.fn.smallerThan('sm')]: {
      borderRadius: 0,
      marginTop: 0,
      marginBottom: 0,
      maxWidth: '100%',
      backgroundColor: 'transparent',
    },
  },
  // "w-full p-5 lg:max-w-md xl:max-w-lg "
  carrouselContainer: {
    width: '100%',
    padding: theme.spacing.md,
    maxWidth: '30rem',
    [theme.fn.smallerThan('md')]: {
      padding: 0,
      maxWidth: '100%',
    },
  },

  formContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    [theme.fn.smallerThan('xl')]: {
      flexDirection: 'column',
      aspectRatio: 'auto',
    },
  },
}))

export default function Home() {
  const { gameState, joinRoom, socket } = useGameContext()
  const [pictureUrl, nextPicture] = useShuffleArray(profilePictures)
  const router = useRouter()
  const { classes } = useStyles()

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
      <div className={classes.containerCard}>
        {/* <div className=" flex w-full max-w-[80%] flex-col lg:flex-row"> */}
        <div className={classes.formContainer}>
          {/* <div className="flex aspect-[16/9] flex-1 flex-col items-center justify-center gap-6  lg:aspect-auto xl:flex-row"> */}
          <div className=" flex justify-center ">
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
          <div className="flex w-full flex-1 flex-col gap-3">
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
        <div className={classes.carrouselContainer}>
          <TutorialCarousel />
        </div>
      </div>
    </Layout>
  )
}