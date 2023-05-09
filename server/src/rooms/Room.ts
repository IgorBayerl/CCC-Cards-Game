// src/rooms/Room.ts
import { Socket } from 'socket.io'

export interface Player {
  id: string
  username: string
  pictureUrl: string
}

export interface RoomConfig {
  roomSize: number
}

export default class Room {
  id: string
  players: Player[]
  leader: Player | null
  roomSize: number

  constructor(id: string, config: RoomConfig = { roomSize: 8 }) {
    this.id = id
    this.players = []
    this.leader = null
    this.roomSize = config.roomSize
  }

  setRoomConfig(config: RoomConfig): void {
    this.roomSize = config.roomSize
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

  get isEmpty(): boolean {
    return this.players.length === 0
  }

  get isFull(): boolean {
    return this.players.length === this.roomSize
  }

  get config(): RoomConfig {
    return {
      roomSize: this.roomSize,
    }
  }
}