// src/rooms/GamePlayer.ts
import Player from './Player'
import { ICardAnswer } from '../models/Deck'

export default class GamePlayer extends Player {
  socketId: string
  cards: ICardAnswer[] = []

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
