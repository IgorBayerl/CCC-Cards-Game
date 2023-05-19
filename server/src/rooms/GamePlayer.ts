// src/rooms/GamePlayer.ts
import Player from './Player'
import { ICardAnswer } from '../models/Deck'


export type TPlayerStatus =
  | 'judge'
  | 'pending'
  | 'done'
  | 'none'
  | 'winner'
  | 'waiting'

export default class GamePlayer extends Player {
  socketId: string
  cards: ICardAnswer[] = []
  score: number = 0
  status: TPlayerStatus = 'pending'
  hasSubmittedCards: boolean = false

  constructor(
    id: string,
    username: string,
    pictureUrl: string,
    socketId: string
  ) {
    super(id, username, pictureUrl)
    this.socketId = socketId
  }
}
