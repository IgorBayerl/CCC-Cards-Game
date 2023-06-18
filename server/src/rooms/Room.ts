// src/rooms/Room.ts
import { type Server, Socket } from 'socket.io'
import Player from './Player'

export interface IRoomConfig {
  roomSize: number
}

export default class Room {
  id: string
  players: Player[]
  leader: Player | null
  protected roomSize: number
  protected io: Server

  constructor(id: string, io: Server, config: IRoomConfig = { roomSize: 8 }) {
    this.io = io
    this.id = id
    this.players = []
    this.leader = null
    this.roomSize = config.roomSize
  }

  setRoomConfig(config: IRoomConfig): void {
    this.roomSize = config.roomSize
  }

  addPlayer(
    socket: Socket,
    username: string,
    pictureUrl: string,
    oldSocketId?: string
  ) {
    // Check if the player already exists using oldSocketId
    const existingPlayerIndex = oldSocketId
      ? this.players.findIndex((p) => p.id === oldSocketId)
      : -1

    if (existingPlayerIndex > -1) {
      // If the player exists, update their details
      this.players[existingPlayerIndex].id = socket.id // Update the new socket id
      this.players[existingPlayerIndex].isOffline = false // Set the player back to online
    } else {
      // If player does not exist, create a new player
      const player = new Player(socket.id, username, pictureUrl)
      this.players.push(player)
      if (!this.leader) {
        this.leader = player
      }
    }
  }

  removePlayer(socket: Socket): boolean {
    const index = this.players.findIndex((player) => player.id === socket.id)
    if (index >= 0) {
      this.players.splice(index, 1)
      if (this.leader && this.leader.id === socket.id) {
        // this.leader = this.players[0] || null
        this.leader = this.players.find((p) => !p.isOffline) || null
      }
      return true
    }
    return false
  }

  disconnectPlayer(socket: Socket): boolean {
    const player = this.players.find((player) => player.id === socket.id)
    if (player) {
      player.isOffline = true
      if (this.leader && this.leader.id === socket.id) {
        this.leader = this.players.find((p) => !p.isOffline) || null
      }
      return true
    }
    return false
  }

  notifyAll(event: string, data: any): void {
    this.io.to(this.id).emit(event, data)
  }

  get isEmpty(): boolean {
    return this.players.length === 0
  }

  get isFull(): boolean {
    return this.players.length === this.roomSize
  }

  get config(): IRoomConfig {
    return {
      roomSize: this.roomSize,
    }
  }
}