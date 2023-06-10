import { TbMoodEmpty } from 'react-icons/tb'
import { IPlayer } from '../GameContext'
import PlayerItem from './PlayerItem'

interface IRoomChairProps {
  player?: IPlayer
  leader?: boolean
}

export default function RoomChair({ player, leader = false }: IRoomChairProps) {
  if (!player) {
    return (
      <div className="flex h-16 items-center rounded-xl bg-gray-200 px-2 py-1 font-bold dark:bg-neutral">
        <div className="flex items-center gap-2">
          <TbMoodEmpty size={35} opacity={0.5} />
          <div className="flex flex-col">Empty</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-gray-200 px-2 py-1 text-xl font-bold dark:bg-neutral ">
      <PlayerItem player={player} leader={leader} />
    </div>
  )
}
