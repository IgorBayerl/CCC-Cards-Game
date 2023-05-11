// src/rooms/Player.ts
export default class Player {
  id: string
  username: string
  pictureUrl: string

  constructor(id: string, username: string, pictureUrl: string) {
    this.id = id
    this.username = username
    this.pictureUrl = pictureUrl
  }
}
