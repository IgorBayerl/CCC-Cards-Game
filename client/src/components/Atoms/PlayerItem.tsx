import { IPlayer, useGameContext } from '../GameContext'
import { TbCheck, TbClock, TbDots, TbGavel } from 'react-icons/tb'
import CustomAvatar from './CustomAvatar'
import {
  getPlayerStatus,
  shouldShowPlayerStatus,
  TPlayerStatus,
} from '~/lib/playerUtils'

interface IPlayerItemProps {
  player: IPlayer
  leader: boolean
}

export default function PlayerItem({ player, leader }: IPlayerItemProps) {
  const { gameState, myId, myStatus } = useGameContext()

  const itsMe = player.id === myId
  const status = getPlayerStatus(player, gameState)
  const showStatus = shouldShowPlayerStatus(gameState)
  const score = player.score

  return (
    <div className="flex w-full max-w-full flex-row items-center gap-2">
      <CustomAvatar
        src={player.pictureUrl}
        leader={leader}
        player={player}
        itsMe={itsMe}
      />
      <div className="flex w-full max-w-full items-center justify-between overflow-hidden truncate">
        <div className="w-full">
          <div className="text-xs font-bold capitalize ">
            {showStatus && `${score} pts`}
          </div>
          <div className="truncate">{player.username}</div>
          {showStatus && <StatusIndicatorText status={status} />}
        </div>
      </div>
      <div>
        {showStatus && <StatusIndicatorIcon status={status} />}
      </div>
    </div>
  )
}

interface IStatusIndicatorProps {
  status: TPlayerStatus
}
function StatusIndicatorIcon({ status }: IStatusIndicatorProps) {
  const iconByStatus = {
    judge: <TbGavel />,
    pending: <TbDots />,
    done: <TbCheck />,
    none: null,
    winner: null,
    waiting: <TbClock />,
  }

  if (!iconByStatus[status]) return null

  return (
    <div
      className="flex items-center gap-2 rounded-full p-2 "
      title={status}
    >
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

  return (
    <div className="text-xs font-bold capitalize ">{textByStatus[status]}</div>
  )
}
