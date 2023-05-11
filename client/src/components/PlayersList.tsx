import { type IPlayer } from '~/components/GameContext'
import { GiCrownedSkull } from 'react-icons/gi'
import Image from 'next/image'
interface IProps {
  players: IPlayer[]
  leader: IPlayer | null
  roomSize: number
}

export default function PlayersList({ players, leader, roomSize }: IProps) {
  const freeSpaces = Array(roomSize - players.length).fill(null)

  return (
    <>
      <div className="flex w-full flex-col items-center justify-center gap-3 overflow-hidden  p-3">
        <div className="flex w-full flex-row rounded-lg border-2  p-3 sm:flex-col">
          {players.map((player, index) => (
            <div key={index}>
              <div className="flex flex-col items-center gap-3 text-2xl font-bold sm:flex-row">
                {player.pictureUrl && (
                  <Image
                    src={player.pictureUrl}
                    alt={`${player.username}'s picture`}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                )}
                <div className="flex">
                  {player.username}{' '}
                  {player.id === leader?.id && <GiCrownedSkull size={30} />}
                </div>
              </div>
            </div>
          ))}

          {freeSpaces.map((_, index) => (
            <div
              key={players.length + index}
              className="text-2xl font-bold text-gray-400"
            >
              Empty Slot
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
