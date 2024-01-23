import RoomChair from './Atoms/RoomChair'
import { motion, AnimatePresence } from 'framer-motion'
import { type Player } from '@ccc-cards-game/types'
interface IProps {
  players: Player[]
  leaderId: string
  roomSize: number
}

export default function PlayersList({ players, leaderId, roomSize }: IProps) {
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
    <div className="flex h-full w-72 flex-col items-center justify-start gap-3 overflow-y-auto overflow-x-clip scrollbar-none">
      <div className="flex w-full flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {sortedPlayers.map((player) => (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring' }}
              key={player.id}
            >
              <RoomChair player={player} leader={leaderId === player.id} />
            </motion.div>
          ))}

          {freeSpaces.map((item) => (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              key={item}
              className=" "
            >
              <RoomChair />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
