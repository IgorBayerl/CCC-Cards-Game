import { type IPlayer } from '~/components/GameContext'
import { GiCrownedSkull } from 'react-icons/gi'

interface IProps {
  players: IPlayer[]
  leader: IPlayer | null
}

export default function PlayersList({ players, leader }: IProps) {
  return (
    <>
      <div className="flex w-full flex-col items-center justify-center gap-3 bg-red-200 p-3">
        <div className="w-full rounded-lg border-2 border-blue-800 p-3">
          {players.map((player, index) => (
            <div key={index}>
              <div className="flex gap-3 text-2xl font-bold">
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
        </div>
      </div>
    </>
  )
}
