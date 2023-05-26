import { type IPlayer } from '~/components/GameContext'
import PlayerItem from './Atoms/PlayerItem'
import RoomChair from './Atoms/RoomChair'
import { motion, AnimatePresence } from 'framer-motion'
interface IProps {
  players: IPlayer[]
  leader: IPlayer | null
  roomSize: number
}

export default function PlayersList({ players, leader, roomSize }: IProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  const freeSpaces = Array.from(
    { length: roomSize - players.length },
    (_, index) => index
  )

  return (
    <>
      <div className="flex  w-full flex-col items-center justify-center gap-3 overflow-y-auto">
        <div className="flex w-full flex-row gap-2 rounded-lg  border-2  px-2 sm:flex-col">
          <AnimatePresence mode="popLayout">
            {sortedPlayers.map((player) => (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring' }}
                key={player.id}
              >
                <div className="flex flex-col items-center gap-3 text-2xl font-bold sm:flex-row">
                  <RoomChair
                    player={player}
                    leader={leader?.id === player.id}
                  />
                </div>
              </motion.div>
            ))}

            {freeSpaces.map((item) => (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                key={item}
                className="text-2xl font-bold text-gray-400"
              >
                <RoomChair />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
