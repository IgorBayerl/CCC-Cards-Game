import { createStyles } from '@mantine/core'
import { IPlayer } from '../GameContext'
import CustomAvatar, { CustomAvatarEmpty } from './CustomAvatar'
import PlayerItem from './PlayerItem'

const useStyles = createStyles((theme) => ({
  avatarWrapper: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[1]
        : theme.colors.gray[1],
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[9]
        : theme.colors.gray[9],
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderTopLeftRadius: theme.radius.xl,
    borderBottomLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
    textTransform: 'capitalize',
    width: 300,
  },
}))

interface IRoomChairProps {
  player?: IPlayer
  leader?: boolean
}

export default function RoomChair({ player, leader = false }: IRoomChairProps) {
  const { classes } = useStyles()

  if (!player) {
    return (
      <div className={classes.avatarWrapper}>
        <div className="flex items-center gap-2">
          <CustomAvatarEmpty
            src="http://localhost:3000/_next/image?url=%2Fprofile%2Fprofile_3.jpg&w=256&q=75"
            size={60}
            className="rounded-full"
          />
          <div className="flex flex-col">Empty</div>
        </div>
      </div>
    )
  }

  return (
    <div className={classes.avatarWrapper}>
      <PlayerItem player={player} leader={leader} />
    </div>
  )
}
