// src/gameEvents.ts

import { Socket } from 'socket.io'
import { IDeck } from './models/Deck' // Import the IDeck interface
import RoomManager from './rooms/RoomManager'
import { SetConfigSchema } from './validation/gameEventsValidation'

/**
 * Handle the event of setting game configuration
 * Room size
 * Change leader
 * Change selected decks
 */
export const handleSetConfig = (
  socket: Socket,
  roomManager: RoomManager,
  config: { roomSize: number; decks: IDeck[] }
) => {
  const result = SetConfigSchema.safeParse(config)
  if (!result.success) {
    socket.emit('game:error', {
      message: 'Invalid configuration',
      error: result.error.errors,
    })
    return
  }

  const roomId = Array.from(socket.rooms)[1]
  const room = roomManager.getRoomById(roomId)
  if (room && room.leader && room.leader.id === socket.id) {
    room.setConfig(config) // Call the setConfig method on the room instance
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
