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
      <div className="rounded-xl px-2 py-1 dark:bg-neutral bg-gray-200 h-16 flex items-center font-bold">
        <div className="flex items-center gap-2">
          <TbMoodEmpty size={35} opacity={0.5}/>
          <div className="flex flex-col">Empty</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl px-2 py-1 dark:bg-neutral bg-gray-200 text-xl font-bold ">
      <PlayerItem player={player} leader={leader} />
    </div>
  )
}
