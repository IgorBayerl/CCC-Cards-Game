import { useGameContext } from '../GameContext'
import { TbCheck, TbClock, TbDots, TbGavel } from 'react-icons/tb'
import CustomAvatar from './CustomAvatar'
import { getPlayerStatus, shouldShowPlayerStatus, type TPlayerStatus } from '~/lib/playerUtils'
import { CgProfile } from 'react-icons/cg'
import { GiCrown } from 'react-icons/gi'
import classNames from 'classnames'
import { type Player } from '~/types'

interface IPlayerItemProps {
  player: Player
  leader: boolean
}

export default function PlayerItem({ player, leader }: IPlayerItemProps) {
  const { gameState, myId } = useGameContext()

  const itsMe = player.id === myId
  const status = getPlayerStatus(player, gameState)
  const showStatus = shouldShowPlayerStatus(gameState)
  const score = player.score
  const isOffline = player.isOffline
  // const isOffline = false

  const styles = classNames('flex w-full max-w-full flex-row items-center gap-2', {
    'text-gray-400 opacity-40': isOffline,
  })

  return (
    <div className={styles}>
      <CustomAvatar src={player.pictureUrl} leader={leader} player={player} itsMe={itsMe} />
      <div className="flex w-full max-w-full items-center justify-between overflow-hidden truncate">
        <div className="w-full">
          <div className="text-xs font-bold capitalize ">{showStatus && `${score} pts`}</div>
          <div className="truncate">{player.username}</div>
          {showStatus && <StatusIndicatorText status={status} />}
        </div>
      </div>
      <div>{showStatus && <StatusIndicatorIcon status={status} />}</div>
    </div>
  )
}

export function MobilePlayerItem({ player, leader }: IPlayerItemProps) {
  const { gameState, myId } = useGameContext()

  const itsMe = player.id === myId
  const status = getPlayerStatus(player, gameState)
  const showStatus = shouldShowPlayerStatus(gameState)
  const score = player.score
  const isOffline = player.isOffline
  // const isOffline = false

  const styles = classNames('flex w-full max-w-full flex-col items-center gap-1', {
    'text-gray-400 opacity-40': isOffline,
  })

  return (
    <div className={styles}>
      <div className="relative">
        <div className="w-14 rounded-full">
          <img src={player.pictureUrl} className="rounded-full" alt="profile pic" />
        </div>
        {leader && <GiCrown color="yellow" className="leader-crown" size={25} />}
        {itsMe && (
          <CgProfile
            title="This is you!"
            color="white"
            className="absolute bottom-0 right-0 rounded-full bg-gray-800 bg-opacity-80 p-0.5"
            size={25}
          />
        )}
        {showStatus && (
          <div className="absolute right-0 top-0 flex h-fit w-fit items-center rounded-full bg-yellow-200 text-center align-middle text-xs font-bold capitalize text-black">
            <h1 className="my-auto px-2">{score}</h1>
          </div>
        )}
        {showStatus && (
          <div className="absolute -bottom-1 -left-1 rounded-full bg-gray-100 bg-opacity-80">
            <StatusIndicatorIcon status={status} mobile={true} />
          </div>
        )}
      </div>
      <div className="flex w-full max-w-full items-center justify-between overflow-hidden truncate">
        <div className="flex w-full justify-center">
          <div className="max-w-[60px] truncate text-xs">{player.username}</div>
        </div>
      </div>
    </div>
  )
}

interface IStatusIndicatorProps {
  status: TPlayerStatus
  mobile?: boolean
}
function StatusIndicatorIcon({ status, mobile = false }: IStatusIndicatorProps) {
  const iconSize = mobile ? 20 : 25

  const iconByStatus = {
    judge: <TbGavel size={iconSize} color="black" />,
    pending: <TbDots size={iconSize} color="black" />,
    done: <TbCheck size={iconSize} color="black" />,
    none: null,
    winner: null,
    waiting: <TbClock size={iconSize} color="black" />,
  }

  if (!iconByStatus[status]) return null

  const styles = classNames('flex items-center gap-2 rounded-full', mobile ? 'p-1' : 'p-2')
  return (
    <div className={styles} title={status}>
      {iconByStatus[status]}
    </div>
  )
}

function StatusIndicatorText({ status }: IStatusIndicatorProps) {
  const textByStatus = {
    judge: 'Judge',
    pending: 'Pending',
    done: 'Done',
    none: null,
    winner: 'Winner',
    waiting: 'Waiting',
  }

  if (!textByStatus[status]) return null

  return <div className="text-xs font-bold capitalize ">{textByStatus[status]}</div>
}
