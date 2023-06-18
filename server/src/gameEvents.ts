// src/gameEvents.ts

import { Socket } from 'socket.io'
import { ICardAnswer } from './models/Deck'
import { IGameConfig } from './models/Game'
import RoomManager from './rooms/RoomManager'
import {
  AdmCommandSchema,
  SetConfigSchema,
} from './validation/gameEventsValidation'

/**
 * Handle the event of setting game configuration
 * Room size
 * Change leader
 * Change selected decks
 */
export const handleSetConfig = (
  socket: Socket,
  roomManager: RoomManager,
  config: IGameConfig
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

type AdmCommand =
  | 'start'
  | 'next_round'
  | 'end'
  | 'start-new-game'
  | 'back-to-lobby'

export const handleAdmCommand = (
  socket: Socket,
  roomManager: RoomManager,
  command: AdmCommand
) => {
  const result = AdmCommandSchema.safeParse(command)
  if (!result.success) {
    socket.emit('game:error', {
      message: 'Invalid command',
      error: result.error.errors,
    })
    return
  }

  const roomId = Array.from(socket.rooms)[1]
  const room = roomManager.getRoomById(roomId)
  if (room && room.leader && room.leader.id === socket.id) {
    // Implement admin command logic here (e.g., start game)

    //get the command type
    //if command start game, validate if the room is ready to start (e.g., enough players, decks, etc.)

    if (command === 'start') {
      room.startGame(socket)
    }

    if (command === 'next_round') {
      room.nextRound()
    }

    if (command === 'start-new-game') {
      room.resetRoom()
      room.startGame(socket)
    }

    if (command === 'back-to-lobby') {
      room.resetRoom()
    }
  }
}

export const handleJudgeDecision = (
  socket: Socket,
  roomManager: RoomManager,
  winningPlayerId: string
) => {
  const roomId = Array.from(socket.rooms)[1]
  const room = roomManager.getRoomById(roomId)
  if (room && room.currentJudge && room.currentJudge.id === socket.id) {
    room.judgeSelection(winningPlayerId)
  }
}

export const handlePlayerSelection = (
  socket: Socket,
  roomManager: RoomManager,
  selectedCards: ICardAnswer[]
) => {
  const roomId = Array.from(socket.rooms)[1]
  const room = roomManager.getRoomById(roomId)

  if (!room) return
  room.playerSelection(selectedCards, socket.id)
}

export const handleRequestNextCard = (
  socket: Socket,
  roomManager: RoomManager
) => {
  const roomId = Array.from(socket.rooms)[1]
  const room = roomManager.getRoomById(roomId)
  if (room && room.currentJudge && room.currentJudge.id === socket.id) {
    room.requestNextCard()
  }
}

export const handleSeeAllRoundAnswers = (
  socket: Socket,
  roomManager: RoomManager
) => {
  const roomId = Array.from(socket.rooms)[1]
  const room = roomManager.getRoomById(roomId)
  if (room && room.currentJudge && room.currentJudge.id === socket.id) {
    room.seeAllRoundAnswers()
  }
}

