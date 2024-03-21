import { GiCrown } from 'react-icons/gi'
import { CgProfile } from 'react-icons/cg'
import { type Player } from '@ccc-cards-game/types'

interface ICustomAvatarProps {
  player: Player
  leader: boolean
  itsMe: boolean
}

export default function CustomAvatar({
  player,
  leader,
  itsMe,
  ...props
}: ICustomAvatarProps) {
  const borderColor = player.isTalking ? 'border-green-400 ' : 'border-transparent'
  //TODO: change border to 4 when is talking starts to work
  return (
    <div className="avatar">
      <div className={`w-16 rounded-full border-0 relative ${borderColor}`}>
        <img alt='avatar_img' src={player.pictureUrl} {...props} />
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
