// src/roomEvents.ts

import { Socket } from 'socket.io'
import RoomManager from './rooms/RoomManager'
import { UsernameSchema } from './validation/roomEventsValidation'

export const handleJoinRoom = (
  socket: Socket,
  roomManager: RoomManager,
  username: string,
  roomId: string
) => {
  const result = UsernameSchema.safeParse(username)

  if (!result.success) {
    socket.emit('room:error', {
      message: 'Invalid username',
      error: result.error.errors,
    })
    return
  }
  const room = roomManager.joinRoom(socket, roomId, username)
  socket.emit('room:joinedRoom', roomId)
  room.notifyState(socket)
}

export const handleLeaveRoom = (socket: Socket, roomManager: RoomManager) => {
  const room = roomManager.leaveRoom(socket)
  if (room) {
    room.notifyState(socket)
  }
}

export const handleAdmCommand = (
  socket: Socket,
  roomManager: RoomManager,
  command: string
) => {
  const roomId = Array.from(socket.rooms)[1]
  const room = roomManager.getRoomById(roomId)
  if (room && room.leader && room.leader.id === socket.id) {
    // Implement admin command logic here (e.g., start game)
    room.notifyState(socket)
  }
}
