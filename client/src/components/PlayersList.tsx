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
      <div className="flex w-full flex-col items-center justify-center gap-3  p-3">
        <div className="w-full rounded-lg border-2 border-blue-800 p-3">
          {players.map((player, index) => (
            <div key={index}>
              <div className="flex items-center gap-3 text-2xl font-bold">
                {player.pictureUrl && (
                  <Image
                    src={player.pictureUrl}
                    alt={`${player.username}'s picture`}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                )}
                {player.username}{' '}
                {player.id === leader?.id && <GiCrownedSkull size={30} />}
              </div>
              <hr
                className={`m-3 border-2 border-blue-800 ${
                  index === players.length - 1 ? 'hidden' : ''
                }`}
              />
            </div>
          ))}
          {freeSpaces.length !== 0 && (
            <hr className="m-3 border-2 border-blue-800" />
          )}
          {freeSpaces.map((_, index) => (
            <div
              key={players.length + index}
              className="text-2xl font-bold text-gray-400"
            >
              Empty Slot
              <hr
                className={`m-3 border-2 border-blue-800 ${
                  index === freeSpaces.length - 1 ? 'hidden' : ''
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
