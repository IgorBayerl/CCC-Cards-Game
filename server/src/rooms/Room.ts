// src/rooms/Room.ts
import { Socket } from 'socket.io'
import { IDeck } from '../models/Deck' // Import the IDeck interface

interface Player {
  id: string
  username: string
  pictureUrl: string
}

export default class Room {
  id: string
  players: Player[]
  leader: Player | null

  private roomSize: number
  private decks: Array<string>
  private scoreToWin: number

  constructor(id: string) {
    this.id = id
    this.players = []
    this.leader = null
    this.roomSize = 4 // Default room size
    this.decks = [] // Default decks
    this.scoreToWin = 10 // Default score to win
  }

  setConfig(config: {
    roomSize: number
    decks: Array<string>
    scoreToWin: number
  }): void {
    this.roomSize = config.roomSize
    this.decks = config.decks
    this.scoreToWin = config.scoreToWin
  }

  addPlayer(socket: Socket, username: string, pictureUrl: string) {
    const player = { id: socket.id, username, pictureUrl }
    this.players.push(player)
    if (!this.leader) {
      this.leader = player
    }
  }

  removePlayer(socket: Socket): boolean {
    const index = this.players.findIndex((player) => player.id === socket.id)
    if (index >= 0) {
      this.players.splice(index, 1)
      if (this.leader && this.leader.id === socket.id) {
        this.leader = this.players[0] || null
      }
      return true
    }
    return false
  }

  isEmpty(): boolean {
    return this.players.length === 0
  }

  notifyState(socket: Socket) {
    const state = {
      players: this.players,
      leader: this.leader,
      config: {
        roomSize: this.roomSize,
        decks: this.decks,
        scoreToWin: this.scoreToWin,
      },
    }
    socket.to(this.id).emit('game:updateState', state)
  }

  notifyPlayerState(socket: Socket): void {
    const state = {
      players: this.players,
      leader: this.leader,
      config: {
        roomSize: this.roomSize,
        decks: this.decks,
        scoreToWin: this.scoreToWin,
      },
    }
    socket.emit('game:updateState', state)
  }
}
