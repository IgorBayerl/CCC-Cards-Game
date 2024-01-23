import { type Player } from '@ccc-cards-game/types'
import { MobileRoomChair } from './Atoms/RoomChair'

interface IProps {
  players: Player[]
  leaderId: string
  roomSize: number
}

export default function MobilePlayersList({ players, leaderId, roomSize }: IProps) {
  // const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isOffline && !b.isOffline) {
      return 1 // Place offline players at the end
    } else if (!a.isOffline && b.isOffline) {
      return -1 // Place online players before offline players
    } else {
      // If both players are online or both are offline, sort by score
      return b.score - a.score
    }
  })

  const freeSpaces = Array.from({ length: roomSize - players.length }, (_, index) => index)

  return (
    <div className="flex h-full w-full items-center justify-start gap-3 overflow-x-auto  scrollbar-none">
      <div className="flex w-full flex-row gap-2">
        {sortedPlayers.map((player) => (
          // <>{JSON.stringify(player)}</>
          <div key={player.id}>
            <MobileRoomChair player={player} leader={leaderId === player.id} />
          </div>
        ))}

        {freeSpaces.map((item) => (
          <div key={item}>
            <MobileRoomChair />
          </div>
        ))}
      </div>
    </div>
  )
}
