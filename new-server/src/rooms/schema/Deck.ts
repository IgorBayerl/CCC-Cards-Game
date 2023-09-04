import {Schema, type, ArraySchema} from "@colyseus/schema";

export class DeckSchema extends Schema {
  @type("string") id: string = "";
  @type("string") title: string = "";
  @type("string") language: string = "";
  @type("string") description: string = "";
  @type("number") darknessLevel: number = 0;
  @type("string") icon: string = "";
  @type("number") questionCount: number = 0;
  @type("number") answerCount: number = 0;
  @type("boolean") selected: boolean = false;
}

export type TDeck = typeof DeckSchema.prototype;
