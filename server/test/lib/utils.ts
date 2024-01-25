import { MapSchema } from '@colyseus/schema';
import { faker } from '@faker-js/faker';
import { PlayerSchema } from '../../src/rooms/schema/Player';

export function generateUsernameWithMaxChar(maxChar: number) {
  const username = faker.internet.userName();
  if (username.length <= maxChar) {
    return username;
  }
  return username.substring(0, maxChar);
}

export function generateStringWithLength(length: number) {
  return faker.string.sample(length)
}

export function generateNewPlayer() {
  return {
    username: generateUsernameWithMaxChar(20),
    pictureUrl: faker.internet.avatar()
  };
}

export function generateReconnectingPlayer(oldPlayerId: string) {
  return {
    oldPlayerId,
    username: generateUsernameWithMaxChar(20),
    pictureUrl: faker.internet.avatar()
  };
}

export function generateNewInvalidPlayer() {
  return {
    username: generateStringWithLength(25),
    pictureUrl: faker.internet.avatar()
  };
}

export function countOnlinePlayers(players: MapSchema<PlayerSchema>): number {
  let onlineCount = 0;
  players.forEach(player => {
    if (!player.isOffline) {
      onlineCount++;
    }
  });
  return onlineCount;
}
