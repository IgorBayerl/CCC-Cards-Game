import { Avatar, AvatarProps, createStyles } from '@mantine/core'
import { GiCrown } from 'react-icons/gi'
import { CgProfile } from 'react-icons/cg'
import { IPlayer } from '../GameContext'

interface ICustomAvatarProps extends AvatarProps {
  player: IPlayer
  leader: boolean
  itsMe: boolean
}

const useStyles = createStyles((theme) => ({
  avatarWrapper: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[5]
        : theme.colors.gray[1],
    borderRadius: '100%',
    padding: 4,
    position: 'relative',
  },
  crown: {
    position: 'absolute',
    top: -10,
    left: -8,
    rotate: '-33deg',
    filter: 'drop-shadow(5px 5px 5px #000000)',
  },
}))

export default function CustomAvatar({
  player,
  leader,
  itsMe,
  ...props
}: ICustomAvatarProps) {
  const { classes } = useStyles()
  return (
    <div className={classes.avatarWrapper}>
      <Avatar src={player.pictureUrl} size={60} {...props} />
      {leader && <GiCrown color="yellow" className="leader-crown" size={30} />}
      {itsMe && (
        <CgProfile
          title="This is you!"
          color="white"
          className="absolute bottom-0 right-0 rounded-full bg-gray-800 p-0.5"
          size={25}
        />
      )}
    </div>
  )
}

export function CustomAvatarEmpty({ ...props }: AvatarProps) {
  const { classes } = useStyles()
  return (
    <div className={classes.avatarWrapper}>
      <Avatar size={60} className="rounded-full" />
    </div>
  )
}
