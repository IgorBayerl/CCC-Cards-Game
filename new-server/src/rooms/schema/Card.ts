import { Schema, type } from "@colyseus/schema";

export class CardSchema extends Schema {
  @type("string") text: string = "";
}

export class AnswerCardSchema extends CardSchema {}

export class QuestionCardSchema extends CardSchema {
  @type("number") spaces: number = 1;
}
