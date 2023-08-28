import {Schema, type, ArraySchema} from "@colyseus/schema";

export class DeckSchema extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("string") language: string = "";
  @type("string") description: string = "";
  @type("number") category: number = 0;
  @type("string") icon: string = "";
  @type("number") questions: number = 0;
  @type("number") answers: number = 0;
  @type("boolean") selected: boolean = false;
}

export type TDeck = typeof DeckSchema.prototype;
