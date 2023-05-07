// src/rooms/Room.ts
import { Socket } from 'socket.io'
import { IDeck } from '../models/Deck' // Import the IDeck interface

interface Player {
  id: string
  username: string
}

export default class Room {
  id: string
  players: Player[]
  leader: Player | null

  private roomSize: number
  private decks: IDeck[]

  constructor(id: string) {
    this.id = id
    this.players = []
    this.leader = null
    this.roomSize = 4 // Default room size
    this.decks = [] // Default decks
  }

  setConfig(config: { roomSize: number; decks: IDeck[] }): void {
    this.roomSize = config.roomSize
    this.decks = config.decks
  }

  addPlayer(socket: Socket, username: string) {
    const player = { id: socket.id, username }
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
    }
    socket.to(this.id).emit('game:updateState', state)
  }

  notifyPlayerState(socket: Socket): void {
    const state = {
      players: this.players,
      leader: this.leader,
    }
    socket.emit('game:updateState', state)
  }
}
