// src/rooms/RoomManager.ts

import { Socket } from 'socket.io'
import Room from './Room'

export default class RoomManager {
  rooms: Map<string, Room>

  constructor() {
    this.rooms = new Map()
  }

  joinRoom(socket: Socket, roomId: string, username: string): Room {
    let room = this.getRoomById(roomId)
    if (!room) {
      room = new Room(roomId)
      this.rooms.set(roomId, room)
    }
    room.addPlayer(socket, username)
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
        if (room.isEmpty()) {
          this.rooms.delete(room.id)
        } else {
          return room
        }
      }
    }
    return null
  }

  getRoomById(roomId: string): Room | undefined {
    return this.rooms.get(roomId)
  }
}
