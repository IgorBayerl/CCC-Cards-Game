import { type IPlayer } from '~/components/GameContext'
import PlayerItem from './Atoms/PlayerItem'
import RoomChair from './Atoms/RoomChair'
interface IProps {
  players: IPlayer[]
  leader: IPlayer | null
  roomSize: number
}

export default function PlayersList({ players, leader, roomSize }: IProps) {
  const freeSpaces = Array(roomSize - players.length).fill(null)
  return (
    <>
      <div className="flex  w-full flex-col items-center justify-center gap-3 overflow-y-auto">
        <div className="flex w-full flex-row gap-2 rounded-lg  border-2 px-2 sm:flex-col">
          {players.map((player, index) => (
            <div key={index}>
              <div className="flex flex-col items-center gap-3 text-2xl font-bold sm:flex-row">
                <RoomChair player={player} leader={leader?.id === player.id} />
              </div>
            </div>
          ))}

          {freeSpaces.map((_, index) => (
            <div
              key={players.length + index}
              className="text-2xl font-bold text-gray-400"
            >
              <RoomChair />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
