import {Schema, type} from "@colyseus/schema";

export class CardSchema extends Schema {
  @type("string") id: string = "";
  @type("string") text: string = "";
}

export type TCard = typeof CardSchema.prototype;

export class AnswerCardSchema extends CardSchema {}

export type TAnswerCard = typeof AnswerCardSchema.prototype;

export class QuestionCardSchema extends CardSchema {
  @type("number") spaces: number = 1;
}

export type TQuestionCard = typeof QuestionCardSchema.prototype;
