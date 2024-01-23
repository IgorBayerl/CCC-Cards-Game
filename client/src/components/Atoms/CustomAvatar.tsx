import { GiCrown } from 'react-icons/gi'
import { CgProfile } from 'react-icons/cg'
import { type Player } from '@ccc-cards-game/shared'

interface ICustomAvatarProps {
  src: string
  player: Player
  leader: boolean
  itsMe: boolean
}

export default function CustomAvatar({
  src,
  player,
  leader,
  itsMe,
  ...props
}: ICustomAvatarProps) {
  return (
    <div className="avatar">
      <div className="w-16 rounded-full">
        <img src={player.pictureUrl} {...props} />
      </div>
      {leader && <GiCrown color="yellow" className="leader-crown" size={25} />}
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
