import { Server } from 'socket.io'
import { createServer } from 'http'
import GameRoom from './GameRoom'

let io: Server
let socket: any

beforeEach(() => {
  const httpServer = createServer()
  io = new Server(httpServer)
  socket = {
    id: 'test_id',
    // add any other properties and methods used in your tests
  }
})

describe('GameRoom', () => {
  it('hello world jest', () => {
    expect(1).toBe(1)
  })
  it('adds a player correctly', () => {
    const gameRoom = new GameRoom('1', io)
    gameRoom.addPlayer(socket, 'player1', 'pictureUrl1')
    expect(gameRoom.players.length).toBe(1)
    expect(gameRoom.players[0].username).toBe('player1')
  })

  // it('adds multiple players correctly', () => {
  //   const gameRoom = new GameRoom('1', io)

  //   const socketPlayer1: any = { id: 'id1' }
  //   const socketPlayer2: any = { id: 'id2' }
  //   const socketPlayer3: any = { id: 'id3' }

  //   // Add player 1
  //   gameRoom.addPlayer(socketPlayer1, 'player1', 'pictureUrl1')
  //   // Add player 2
  //   gameRoom.addPlayer(socketPlayer2, 'player2', 'pictureUrl2')
  //   // Add player 3
  //   gameRoom.addPlayer(socketPlayer3, 'player3', 'pictureUrl3')

  //   expect(gameRoom.players.length).toBe(3)
  //   expect(gameRoom.players[0].username).toBe('player1')
  //   expect(gameRoom.players[1].username).toBe('player2')
  //   expect(gameRoom.players[2].username).toBe('player3')
  // })
})
