import {beforeAll, afterAll, beforeEach, describe, expect, test} from "vitest";
import {ColyseusTestServer, boot} from "@colyseus/testing";

import appConfig from "../src/app.config";
import {MyRoomState} from "../src/rooms/schema/MyRoomState";
import {
  countOnlinePlayers,
  generateNewInvalidPlayer,
  generateNewPlayer,
  generateRadomAnswerCard,
  generateReconnectingPlayer,
  generateStringWithLength,
} from "./lib/utils";
import {faker} from "@faker-js/faker";
import {AnswerCardSchema, PlayerSchema} from "../src/rooms/schema";
import {ArraySchema} from "@colyseus/schema";
import {AnswerCard} from "@ccc-cards-game/types";
import {TPlayerStatus} from "../src/rooms/schema/Player";

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
    expect(client1.state.currentQuestionCard).toEqual({id: "", text: "", spaces: 1});
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
      pictureUrl: faker.internet.avatar(),
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
      username: "",
      pictureUrl: faker.internet.avatar(),
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
      pictureUrl: faker.internet.avatar(),
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
      pictureUrl: 5,
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

  describe.only("PlayerSchema", () => {
    test("addPoint increases the score by 1", () => {
      const player = new PlayerSchema();
      player.score = 0;
      player.addPoint();
      expect(player.score).toBe(1);
    });

    test("setCards correctly sets the cards", () => {
      const player = new PlayerSchema();

      const newCard1 = generateRadomAnswerCard();
      const newCard2 = generateRadomAnswerCard();

      const newCards = new ArraySchema<AnswerCardSchema>();

      newCards.push(newCard1);
      newCards.push(newCard2);

      expect(player.cards.length).toBe(0);

      player.setCards(newCards);

      expect(player.cards.length).toBe(2);

      expect(player.cards[0].id).toBe(newCard1.id);
      expect(player.cards[0].text).toBe(newCard1.text);

      expect(player.cards[1].id).toBe(newCard2.id);
      expect(player.cards[1].text).toBe(newCard2.text);
    });

    test("setCards set other group of cards", () => {
      const player = new PlayerSchema();

      const newCard1 = generateRadomAnswerCard();

      const newCards1 = new ArraySchema<AnswerCardSchema>();

      newCards1.push(newCard1);

      const newCard2 = generateRadomAnswerCard();
      const newCard3 = generateRadomAnswerCard();
      const newCard4 = generateRadomAnswerCard();

      const newCards2 = new ArraySchema<AnswerCardSchema>();

      newCards2.push(newCard2);
      newCards2.push(newCard3);
      newCards2.push(newCard4);

      expect(player.cards.length).toBe(0);

      player.setCards(newCards1);
      expect(player.cards.length).toBe(1);

      player.setCards(newCards2);
      expect(player.cards.length).toBe(3);

      player.setCards(newCards1);
      expect(player.cards.length).toBe(1);
    });

    test("addCardsToPlayerHand adds a single card to the player hand", () => {
      const player = new PlayerSchema();
      const initialCard = generateRadomAnswerCard();
      player.setCards(new ArraySchema<AnswerCardSchema>(initialCard));

      const newCard = generateRadomAnswerCard();
      player.addCardsToPlayerHand([newCard]);

      expect(player.cards.length).toBe(2);
      expect(player.cards).toContainEqual(newCard);
    });

    test("addCardsToPlayerHand adds multiple cards to the player hand", () => {
      const player = new PlayerSchema();
      const initialCards = new ArraySchema<AnswerCardSchema>(generateRadomAnswerCard(), generateRadomAnswerCard());
      player.setCards(initialCards);

      const newCards = [generateRadomAnswerCard(), generateRadomAnswerCard()];
      player.addCardsToPlayerHand(newCards);

      expect(player.cards.length).toBe(4);
      newCards.forEach(card => {
        expect(player.cards).toContainEqual(card);
      });
    });

    test("addCardsToPlayerHand adds cards to an initially empty hand", () => {
      const player = new PlayerSchema();
      player.setCards(new ArraySchema<AnswerCardSchema>());

      const newCards = [generateRadomAnswerCard(), generateRadomAnswerCard()];
      player.addCardsToPlayerHand(newCards);

      expect(player.cards.length).toBe(2);
      newCards.forEach(card => {
        expect(player.cards).toContainEqual(card);
      });
    });

    test("removeCardsFromPlayerHand removes a single specified card", () => {
      const player = new PlayerSchema();
      const cardToRemove = generateRadomAnswerCard();
      const otherCard = generateRadomAnswerCard();
      player.setCards(new ArraySchema<AnswerCardSchema>(cardToRemove, otherCard));

      player.removeCardsFromPlayerHand(new ArraySchema<AnswerCardSchema>(cardToRemove));

      expect(player.cards.length).toBe(1);
      expect(player.cards).not.toContainEqual(cardToRemove);
      expect(player.cards).toContainEqual(otherCard);
    });

    test("removeCardsFromPlayerHand removes multiple specified cards", () => {
      const player = new PlayerSchema();
      const cardsToRemove = new ArraySchema<AnswerCardSchema>(generateRadomAnswerCard(), generateRadomAnswerCard());
      const remainingCard = generateRadomAnswerCard();
      player.setCards(new ArraySchema<AnswerCardSchema>(...cardsToRemove, remainingCard));

      player.removeCardsFromPlayerHand(cardsToRemove);

      expect(player.cards.length).toBe(1);
      cardsToRemove.forEach(card => {
        expect(player.cards).not.toContainEqual(card);
      });
      expect(player.cards).toContainEqual(remainingCard);
    });

    test("removeCardsFromPlayerHand does not change hand if cards to remove are not present", () => {
      const player = new PlayerSchema();
      const existingCards = new ArraySchema<AnswerCardSchema>(generateRadomAnswerCard(), generateRadomAnswerCard());
      player.setCards(existingCards);

      const nonExistingCards = new ArraySchema<AnswerCardSchema>(generateRadomAnswerCard(), generateRadomAnswerCard());
      player.removeCardsFromPlayerHand(nonExistingCards);

      expect(player.cards.length).toBe(2);
      existingCards.forEach(card => {
        expect(player.cards).toContainEqual(card);
      });
    });

    test("getRandomAnswers returns random cards when enough cards are available", () => {
      const player = new PlayerSchema();
      for (let i = 0; i < 10; i++) {
        player.cards.push(generateRadomAnswerCard());
      }

      const randomAnswers1 = player.getRandomAnswers(5);
      const randomAnswers2 = player.getRandomAnswers(5);

      expect(randomAnswers1.length).toBe(5);
      expect(randomAnswers2.length).toBe(5);
      expect(randomAnswers1).not.toEqual(randomAnswers2); // This might fail occasionally due to random chance
    });
    test("getRandomAnswers returns all cards when requested more than available", () => {
      const player = new PlayerSchema();
      for (let i = 0; i < 3; i++) {
        player.cards.push(generateRadomAnswerCard());
      }

      const randomAnswers = player.getRandomAnswers(5);

      expect(randomAnswers.length).toBe(3);
    });

    test("getRandomAnswers returns empty array when no cards are available", () => {
      const player = new PlayerSchema();
      const randomAnswers = player.getRandomAnswers(5);

      expect(randomAnswers.length).toBe(0);
    });

    test("getRandomAnswers returns specified number of random cards", () => {
      const player = new PlayerSchema();
      for (let i = 0; i < 10; i++) {
        player.cards.push(generateRadomAnswerCard());
      }

      const count = 4;
      const randomAnswers = player.getRandomAnswers(count);

      expect(randomAnswers.length).toBe(count);
    });

    describe("setStatus Method", () => {
      let player: PlayerSchema;

      beforeEach(() => {
        player = new PlayerSchema();
      });

      const statusValues: TPlayerStatus[] = ["judge", "pending", "done", "none", "winner", "waiting"];

      statusValues.forEach(status => {
        test(`setStatus correctly sets status to ${status}`, () => {
          player.setStatus(status);
          expect(player.status).toBe(status);
        });
      });
    });

    test("cloneFrom correctly clones properties from another PlayerSchema", () => {
      const originalPlayer = new PlayerSchema();
      originalPlayer.username = "OriginalPlayer";
      originalPlayer.score = 10;
      originalPlayer.status = "judge";
      originalPlayer.hasSubmittedCards = true;
      originalPlayer.cards = new ArraySchema<AnswerCardSchema>(generateRadomAnswerCard(), generateRadomAnswerCard());
      originalPlayer.isOffline = true;

      const clonedPlayer = new PlayerSchema();
      clonedPlayer.cloneFrom(originalPlayer);

      expect(clonedPlayer.username).toBe(originalPlayer.username);
      expect(clonedPlayer.score).toBe(originalPlayer.score);
      expect(clonedPlayer.status).toBe(originalPlayer.status);
      expect(clonedPlayer.hasSubmittedCards).toBe(originalPlayer.hasSubmittedCards);
      expect(clonedPlayer.cards).toEqual(originalPlayer.cards);
      expect(clonedPlayer.isOffline).toBe(false);
    });
  });
});
