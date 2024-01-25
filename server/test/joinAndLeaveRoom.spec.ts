import { beforeAll, afterAll, beforeEach, describe, expect, test } from 'vitest';
import { ColyseusTestServer, boot } from "@colyseus/testing";

import appConfig from "../src/app.config";
import { MyRoomState } from "../src/rooms/schema/MyRoomState";
import { countOnlinePlayers, generateNewInvalidPlayer, generateNewPlayer, generateReconnectingPlayer, generateStringWithLength } from './lib/utils';
import { faker } from '@faker-js/faker';

describe("Join, Leave, Reconnect and Change rooms", () => {
  let colyseus: ColyseusTestServer;

  beforeAll(async () => {
    colyseus = await boot(appConfig);
  });

  afterAll(async () => {
    await colyseus.shutdown();
  });

  beforeEach(async () => {
    await colyseus.cleanup();
  });

  test("connecting into a room", async () => {
    const joinOptions = generateNewPlayer();
  
    const room = await colyseus.createRoom<MyRoomState>("my_room", joinOptions);
    const client1 = await colyseus.connectTo(room, joinOptions);
  
    await room.waitForNextPatch();
  
    // Use Vitest's `expect` for assertions
    expect(client1.sessionId).toBe(room.clients[0].sessionId);
  
    // Verify the player is added to the room with correct details
    const players = client1.state.players;
    const player = players.get(client1.sessionId);
    expect(player).toBeDefined();
  
    if (!player) throw new Error("Player is undefined");
  
    expect(player.username).toBe(joinOptions.username);
    expect(player.pictureUrl).toBe(joinOptions.pictureUrl);
  
    // Player properties
    expect(player.score).toBe(0);
    expect(player.status).toBe("pending");
    expect(player.hasSubmittedCards).toBe(false);
    expect(Array.from(player.cards)).toEqual([]);
    expect(player.isOffline).toBe(false);

    const onlinePlayersInRoom = countOnlinePlayers(room.state.players);
    expect(onlinePlayersInRoom).toBe(1);
    
    // Verify that the first player is set as the leader
    expect(client1.state.leader).toBe(client1.sessionId);  
  
    // Check other parts of the state
    expect(client1.state.roomStatus).toBe("waiting");
  
    // Config Validation
    expect(client1.state.config.scoreToWin).toBe(8);
    expect(client1.state.config.roundTime).toBe(20);
    expect(client1.state.config.roomSize).toBe(4);
    expect(Array.from(client1.state.config.availableDecks)).toEqual([]);
  
    // Round and Card State
    expect(client1.state.rounds.length).toBe(0);
    expect(client1.state.currentQuestionCard).toEqual({ id: "", text: "", spaces: 1 });
    expect(client1.state.usedQuestionCards.length).toBe(0);
    expect(client1.state.usedAnswerCards.length).toBe(0);
  
    // Judge Property (depends on your game's logic)
    expect(client1.state.judge).toBe(""); 
  });
  
  test("connecting two players into a room", async () => {
    const room = await colyseus.createRoom<MyRoomState>("my_room", generateNewPlayer());

    const client1 = await colyseus.connectTo(room, generateNewPlayer());
    await room.waitForNextPatch();
    const client2 = await colyseus.connectTo(room, generateNewPlayer());
    await room.waitForNextPatch();

    // Assert room has two players
    const onlinePlayersInRoom = countOnlinePlayers(room.state.players);
    expect(onlinePlayersInRoom).toBe(2);
  });

  // Test for connecting three players
  test("connecting three players into a room", async () => {
    const room = await colyseus.createRoom<MyRoomState>("my_room", generateNewPlayer());

    const client1 = await colyseus.connectTo(room, generateNewPlayer());
    await room.waitForNextPatch();
    const client2 = await colyseus.connectTo(room, generateNewPlayer());
    await room.waitForNextPatch();
    const client3 = await colyseus.connectTo(room, generateNewPlayer());
    await room.waitForNextPatch();

    // Assert room has three players
    const onlinePlayersInRoom = countOnlinePlayers(room.state.players);
    expect(onlinePlayersInRoom).toBe(3);
    // Additional assertions...
  });

  test("connecting more players than room max", async () => {
    const room = await colyseus.createRoom<MyRoomState>("my_room", generateNewPlayer());
    const maxPlayers = room.state.config.roomSize;
  
    let playersConnected = 0;
    for (let i = 0; i < maxPlayers + 1; i++) {
      try {
        await colyseus.connectTo(room, generateNewPlayer());
        playersConnected++;
        await room.waitForNextPatch();
      } catch (error) {
        // Expect an error when trying to connect more players than the room max
        expect(error).toBeDefined();
  
        // Check if error message contains "is locked"
        expect(error.message).toContain("is locked");
  
        // Check if error message contains the room ID
        expect(error.message).toContain(room.roomId);
      }
    }
  
    // Assert room does not exceed max players
    expect(playersConnected).toBeLessThanOrEqual(maxPlayers);
  });

  test("try connecting invalid player, name with more than 20 char", async () => {
    const room = await colyseus.createRoom<MyRoomState>("my_room", generateNewPlayer());
    await room.waitForNextPatch();
  
    // Try connecting with an invalid player
    const joinOptions = {
      username: generateStringWithLength(25),
      pictureUrl: faker.internet.avatar()
    };
  
    let client;
    try {
      client = await colyseus.connectTo(room, joinOptions);
    } catch (error) {
      // Expect an error when trying to connect an invalid player
      expect(error).toBeDefined();
      expect(error.message).toContain("Invalid join request");
    }
  
    // Assert that client was not successfully connected
    expect(client).toBeUndefined();
  });

  test("try connecting invalid player, name with less than 1 char", async () => {
    const room = await colyseus.createRoom<MyRoomState>("my_room", generateNewPlayer());
    await room.waitForNextPatch();
  
    // Try connecting with an invalid player
    const joinOptions = {
      username: '',
      pictureUrl: faker.internet.avatar()
    };
  
    let client;
    try {
      client = await colyseus.connectTo(room, joinOptions);
    } catch (error) {
      // Expect an error when trying to connect an invalid player
      expect(error).toBeDefined();
      expect(error.message).toContain("Invalid join request");
    }
  
    // Assert that client was not successfully connected
    expect(client).toBeUndefined();
  });

  test("try connecting invalid player, name with number", async () => {
    const room = await colyseus.createRoom<MyRoomState>("my_room", generateNewPlayer());
    await room.waitForNextPatch();
  
    // Try connecting with an invalid player
    const joinOptions = {
      username: 5,
      pictureUrl: faker.internet.avatar()
    };
  
    let client;
    try {
      client = await colyseus.connectTo(room, joinOptions);
    } catch (error) {
      // Expect an error when trying to connect an invalid player
      expect(error).toBeDefined();
      expect(error.message).toContain("Invalid join request");
    }
  
    // Assert that client was not successfully connected
    expect(client).toBeUndefined();
  });

  test("try connecting invalid player, picture is number", async () => {
    const room = await colyseus.createRoom<MyRoomState>("my_room", generateNewPlayer());
    await room.waitForNextPatch();
  
    // Try connecting with an invalid player
    const joinOptions = {
      username: generateStringWithLength(15),
      pictureUrl: 5
    };
  
    let client;
    try {
      client = await colyseus.connectTo(room, joinOptions);
    } catch (error) {
      // Expect an error when trying to connect an invalid player
      expect(error).toBeDefined();
      expect(error.message).toContain("Invalid join request");
    }
  
    // Assert that client was not successfully connected
    expect(client).toBeUndefined();
  });
  
  test("players joining specific rooms", async () => {
    // Player 1 creates Room 1
    const room1 = await colyseus.createRoom<MyRoomState>("my_room", generateNewPlayer());
    const player1 = await colyseus.connectTo(room1, generateNewPlayer());
    await room1.waitForNextPatch();
  
    // Player 2 creates Room 2
    const room2 = await colyseus.createRoom<MyRoomState>("my_room", generateNewPlayer());
    const player2 = await colyseus.connectTo(room2, generateNewPlayer());
    await room2.waitForNextPatch();
  
    // Player 3 joins Room 1
    const player3 = await colyseus.connectTo(room1, generateNewPlayer());
    await room1.waitForNextPatch();
  
    // Player 4 joins Room 2
    const player4 = await colyseus.connectTo(room2, generateNewPlayer());
    await room2.waitForNextPatch();
  
    // Assert Room 1 has two players
    const onlinePlayersInRoom1 = countOnlinePlayers(room1.state.players);
    expect(onlinePlayersInRoom1).toBe(2);
  
    // Assert Room 2 has two players
    const onlinePlayersInRoom2 = countOnlinePlayers(room2.state.players);
    expect(onlinePlayersInRoom2).toBe(2);
  });

  test("disconnecting player1 from room1 and connecting to room2", async () => {
    // Player 1 creates Room 1
    const room1 = await colyseus.createRoom<MyRoomState>("my_room", generateNewPlayer());
    const player1 = await colyseus.connectTo(room1, generateNewPlayer());
    await room1.waitForNextPatch();
  
    // Player 2 creates Room 2
    const room2 = await colyseus.createRoom<MyRoomState>("my_room", generateNewPlayer());
    const player2 = await colyseus.connectTo(room2, generateNewPlayer());
    await room2.waitForNextPatch();
  
    // Player 3 joins Room 1
    const player3 = await colyseus.connectTo(room1, generateNewPlayer());
    await room1.waitForNextPatch();
  
    // Player 4 joins Room 2
    const player4 = await colyseus.connectTo(room2, generateNewPlayer());
    await room2.waitForNextPatch();
  
    // Disconnect players from Room 1
    await player1.leave();
    await room2.waitForNextPatch();
  
    // Assert Room 1 has 1 players
    const onlinePlayersInRoom1 = countOnlinePlayers(room1.state.players);
    expect(onlinePlayersInRoom1).toBe(1);
  
    // Assert Room 2 still has two players
    const onlinePlayersInRoom2 = countOnlinePlayers(room2.state.players);
    expect(onlinePlayersInRoom2).toBe(2);


    // Reconnect player 1 to room 2
    const player1Reconnected = await colyseus.connectTo(room2, generateReconnectingPlayer(player1.sessionId));
    await room2.waitForNextPatch();


    const onlinePlayersInRoom2AfterPlayer1ChangeRoom = countOnlinePlayers(room2.state.players);
    expect(onlinePlayersInRoom2AfterPlayer1ChangeRoom).toBe(3);

    const onlinePlayersInRoom1AfterPlayer1ChangeRoom = countOnlinePlayers(room1.state.players);
    expect(onlinePlayersInRoom1AfterPlayer1ChangeRoom).toBe(1);
    // because there is 2 in total but 1 online
    expect(room1.state.players.size).toBe(2);
  });
  
  test("disconnecting player1 from room1 and reconnecting", async () => {
    // Player 1 creates Room 1
    const room1 = await colyseus.createRoom<MyRoomState>("my_room", generateNewPlayer());
    const player1 = await colyseus.connectTo(room1, generateNewPlayer());
    await room1.waitForNextPatch();
  
    // Player 2 creates Room 2
    const room2 = await colyseus.createRoom<MyRoomState>("my_room", generateNewPlayer());
    const player2 = await colyseus.connectTo(room2, generateNewPlayer());
    await room2.waitForNextPatch();
  
    // Player 3 joins Room 1
    const player3 = await colyseus.connectTo(room1, generateNewPlayer());
    await room1.waitForNextPatch();
  
    // Player 4 joins Room 2
    const player4 = await colyseus.connectTo(room2, generateNewPlayer());
    await room2.waitForNextPatch();
  
    // Disconnect players from Room 1
    await player1.leave();
    await room2.waitForNextPatch();
  
    // Assert Room 1 has 1 players
    const onlinePlayersInRoom1 = countOnlinePlayers(room1.state.players);
    expect(onlinePlayersInRoom1).toBe(1);
  
    // Assert Room 2 still has two players online
    const onlinePlayersInRoom2 = countOnlinePlayers(room2.state.players);
    expect(onlinePlayersInRoom2).toBe(2);

    // Reconnect player 1 to room 2
    const player1Reconnected = await colyseus.connectTo(room1, generateReconnectingPlayer(player1.sessionId));
    await room2.waitForNextPatch();

    const onlinePlayersInRoom1AfterPlayer1Reconnect = countOnlinePlayers(room1.state.players);
    expect(onlinePlayersInRoom1AfterPlayer1Reconnect).toBe(2);

    // And total of 2 players because 1 reconnected
    expect(room1.state.players.size).toBe(2);

    const totalPlayersInRoom1 = countOnlinePlayers(room1.state.players);
    expect(totalPlayersInRoom1).toBe(2);
  });
  
});
