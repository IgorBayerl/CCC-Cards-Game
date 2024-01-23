import { TbMoodEmpty } from 'react-icons/tb'
import PlayerItem, { MobilePlayerItem } from './PlayerItem'
import useTranslation from 'next-translate/useTranslation'
import { type Player } from '@ccc-cards-game/shared'

interface IRoomChairProps {
  player?: Player
  leader?: boolean
}

export default function RoomChair({ player, leader = false }: IRoomChairProps) {
  const { t } = useTranslation('game')
  if (!player) {
    return (
      <div className="flex h-16 items-center rounded-xl bg-white bg-opacity-70 px-2 py-1 font-bold">
        <div className="flex items-center gap-2">
          <TbMoodEmpty size={35} opacity={0.5} />
          <div className="flex flex-col">{t('i-empty')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white bg-opacity-70 px-2 py-1 text-xl font-bold ">
      <PlayerItem player={player} leader={leader} />
    </div>
  )
}

export function MobileRoomChair({ player, leader = false }: IRoomChairProps) {
  if (!player) {
    return (
      <div className="flex h-full w-16 items-center justify-center rounded-xl bg-white bg-opacity-70 px-2 py-1 font-bold">
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <TbMoodEmpty size={25} opacity={0.5} />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white bg-opacity-70 px-2 py-1 text-xl font-bold ">
      <MobilePlayerItem player={player} leader={leader} />
    </div>
  )
}
