// src/rooms/GamePlayer.ts
import { Schema, type, ArraySchema } from "@colyseus/schema";
import { AnswerCardSchema } from "./Card";

export type TPlayerStatus =
  | 'judge'
  | 'pending'
  | 'done'
  | 'none'
  | 'winner'
  | 'waiting';

export class Player extends Schema {
  @type("string") id: string;
  @type("string") username: string;
  @type("string") pictureUrl: string;
  @type("string") socketId: string;
  @type([AnswerCardSchema]) cards = new ArraySchema<AnswerCardSchema>(); 
  @type("number") score = 0;
  @type("string") status: TPlayerStatus = 'pending';
  @type("boolean") hasSubmittedCards: boolean = false;

  timeout?: NodeJS.Timeout;
}
