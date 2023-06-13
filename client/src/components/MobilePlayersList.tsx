import { type IPlayer } from '~/components/GameContext'
import { MobileRoomChair } from './Atoms/RoomChair'

interface IProps {
  players: IPlayer[]
  leader: IPlayer | null
  roomSize: number
}

export default function MobilePlayersList({ players, leader, roomSize }: IProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  const freeSpaces = Array.from(
    { length: roomSize - players.length },
    (_, index) => index
  )

  return (
    <div className="flex h-full w-full items-center justify-start gap-3 overflow-x-auto  scrollbar-none">
      <div className="flex w-full flex-row gap-2">
        {sortedPlayers.map((player) => (
          <div
            key={player.id}
          >
            <MobileRoomChair player={player} leader={leader?.id === player.id} />
          </div>
        ))}

        {freeSpaces.map((item) => (
          <div
            key={item}
          >
            <MobileRoomChair />
          </div>
        ))}
      </div>
    </div>
  )
}
