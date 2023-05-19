import { ActionIcon, Button, createStyles } from '@mantine/core'
import { IconArrowBack, IconVolume, IconVolumeOff } from '@tabler/icons-react'
import router from 'next/router'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import { CopyToClipboard } from '../Atoms/CopyToClipboard'
import { useGameContext } from '../GameContext'
import PlayersList from '../PlayersList'
import Image from 'next/image'
import MuteButton from '../Atoms/MuteButton'
import ContainerFooter from './ContainerFooter'
import ContainerHeader from './ContainerHeader'

interface IInGameLayoutProps {
  children: React.ReactNode
}

const useStyles = createStyles((theme) => ({
  containerCard: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[5]
        : theme.colors.gray[2],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    marginRight: theme.spacing.md,
    marginLeft: theme.spacing.md,
    padding: theme.spacing.md,
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    // [theme.fn.smallerThan('md')]: {
    //   flexDirection: 'column',
    // },
    [theme.fn.smallerThan('sm')]: {
      borderRadius: 0,
      margin: 0,
      padding: 0,
      maxWidth: '100%',
      backgroundColor: 'transparent',
    },
  },
  gameContainer: {
    flexGrow: 1,
    borderRadius: theme.radius.md,
    border: `3px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]
    }`,
  },
}))

export default function InGameLayout({ children }: IInGameLayoutProps) {
  const { classes } = useStyles()

  const { roomId, gameState, gameConfig, leaveRoom } = useGameContext()

  const handleLeaveRoom = () => {
    void router.push('/')
    leaveRoom()
  }

  useEffect(() => {
    if (!roomId) handleLeaveRoom()
  }, [roomId])

  return (
    <div className={classes.containerCard}>
      <ContainerHeader />
      <div className="flex flex-col overflow-hidden rounded-xl border sm:flex-row">
        <div className="min-w-fit">
          <PlayersList
            players={gameState.players}
            leader={gameState.leader}
            roomSize={gameConfig.roomSize}
          />
        </div>
        <div className={classes.gameContainer}>{children}</div>
      </div>
      <ContainerFooter />
    </div>
  )
}
