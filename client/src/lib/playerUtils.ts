import { type MyRoomState, type Player } from '@ccc-cards-game/shared'

export function isPlayerLeader(player: Player, gameState: MyRoomState): boolean {
  return player.id === gameState.leader
}

export function isPlayerJudge(player: Player, gameState: MyRoomState): boolean {
  return player.id === gameState.judge
}

export type TPlayerStatus = 'judge' | 'pending' | 'done' | 'none' | 'winner' | 'waiting'

export function getPlayerStatus(player: Player, gameState: MyRoomState) {
  const status = gameState.players.get(player.id)?.status
  return status || 'none'
}

export function shouldShowPlayerStatus(gameState: MyRoomState): boolean {
  const statusRelation = {
    waiting: false,
    starting: false,
    playing: true,
    judging: true,
    finished: true,
    results: true,
  }
  return statusRelation[gameState.roomStatus]
}
