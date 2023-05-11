// src/rooms/RoomManager.ts

import { type Server, type Socket } from 'socket.io'
import GameRoom from './GameRoom'

export default class RoomManager {
  rooms: Map<string, GameRoom>
  io: Server
  constructor(io: Server) {
    this.rooms = new Map()
    this.io = io
  }

  joinRoom(
    socket: Socket,
    roomId: string,
    username: string,
    pictureUrl: string
  ): GameRoom {
    let room = this.getRoomById(roomId)
    if (!room) {
      room = new GameRoom(roomId, this.io)
      this.rooms.set(roomId, room)
    }
    room.addPlayer(socket, username, pictureUrl)
    socket.join(room.id)
    room.notifyPlayerState(socket)
    console.log(`Player ${socket.id} joined room ${room.id}`)
    return room
  }

  leaveRoom(socket: Socket) {
    for (const room of this.rooms.values()) {
      if (room.removePlayer(socket)) {
        console.log(`Player ${socket.id} left room ${room.id}`)
        socket.leave(room.id)
        if (room.isEmpty) {
          this.rooms.delete(room.id)
        } else {
          return room
        }
      }
    }
    return null
  }

  getRoomById(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId)
  }
}
