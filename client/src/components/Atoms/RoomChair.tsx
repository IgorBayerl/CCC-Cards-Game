import { IPlayer } from '../GameContext'
import CustomAvatar, { CustomAvatarEmpty } from './CustomAvatar'
import PlayerItem from './PlayerItem'

interface IRoomChairProps {
  player?: IPlayer
  leader?: boolean
}

export default function RoomChair({ player, leader = false }: IRoomChairProps) {
  if (!player) {
    return (
      <div className="">
        <div className="flex items-center gap-2">
          <CustomAvatarEmpty src="http://localhost:3000/_next/image?url=%2Fprofile%2Fprofile_3.jpg&w=256&q=75" />
          <div className="flex flex-col">Empty</div>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <PlayerItem player={player} leader={leader} />
    </div>
  )
}
