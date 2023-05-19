import { IGameState, IPlayer } from '~/components/GameContext'

export function isPlayerLeader(
  player: IPlayer,
  gameState: IGameState
): boolean {
  return player.id === gameState.leader?.id
}

export function isPlayerJudge(player: IPlayer, gameState: IGameState): boolean {
  return player.id === gameState.judge?.id
}

export type TPlayerStatus =
  | 'judge'
  | 'pending'
  | 'done'
  | 'none'
  | 'winner'
  | 'waiting'

export function getPlayerStatus(player: IPlayer, gameState: IGameState) {
  const status = gameState.players.find((p) => p.id === player.id)?.status
  return status || 'none'
}

export function shouldShowPlayerStatus(gameState: IGameState): boolean {
  const statusRelation = {
    waiting: false,
    starting: false,
    playing: true,
    judging: true,
    finished: true,
  }
  return statusRelation[gameState.status]
}
