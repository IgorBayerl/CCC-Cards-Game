import { IPlayer, useGameContext } from '../GameContext'
import { TbCheck, TbClock, TbDots, TbGavel } from 'react-icons/tb'
import CustomAvatar from './CustomAvatar'
import {
  getPlayerStatus,
  shouldShowPlayerStatus,
  TPlayerStatus,
} from '~/lib/playerUtils'
import { CgProfile } from 'react-icons/cg'
import { GiCrown } from 'react-icons/gi'
import classNames from 'classnames'

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
      <div>{showStatus && <StatusIndicatorIcon status={status} />}</div>
    </div>
  )
}


export function MobilePlayerItem({ player, leader }: IPlayerItemProps) {
  const { gameState, myId, myStatus } = useGameContext()

  const itsMe = player.id === myId
  const status = getPlayerStatus(player, gameState)
  const showStatus = shouldShowPlayerStatus(gameState)
  const score = player.score

  return (
    <div className="flex w-full max-w-full flex-col items-center gap-1">
      <div className="relative">
        <div className="rounded-full w-14">
          <img src={player.pictureUrl} className='rounded-full'/>
        </div>
        {leader && <GiCrown color="yellow" className="leader-crown" size={25} />}
        {itsMe && (
          <CgProfile
            title="This is you!"
            color="white"
            className="absolute bottom-0 right-0 rounded-full bg-gray-800 p-0.5 bg-opacity-80"
            size={25}
          />
        )}
        {showStatus && (
          <div className="absolute top-0 right-0 bg-yellow-200 text-black rounded-full font-bold text-xs capitalize w-fit text-center align-middle h-fit flex items-center">
            <h1 className='my-auto px-2'>{score}</h1>
          </div>
        )}
        {showStatus && (
          <div className='absolute -left-1 -bottom-1 bg-gray-800 rounded-full bg-opacity-80'>
            <StatusIndicatorIcon status={status} mobile={true}/>
          </div>
        )}
      </div>
      <div className="flex w-full max-w-full items-center justify-between overflow-hidden truncate">
        <div className="w-full flex justify-center">
          <div className="truncate text-xs max-w-[60px]">{player.username}</div>
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
    judge: <TbGavel size={iconSize} color='white' />,
    pending: <TbDots size={iconSize} color='white' />,
    done: <TbCheck size={iconSize} color='white' />,
    none: null,
    winner: null,
    waiting: <TbClock size={iconSize} color='white' />,
  }

  if (!iconByStatus[status]) return null

  const styles = classNames('flex items-center gap-2 rounded-full',
    mobile ? 'p-1' : 'p-2'
  )
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

  return (
    <div className="text-xs font-bold capitalize ">{textByStatus[status]}</div>
  )
}
