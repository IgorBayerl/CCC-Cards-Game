import {Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import {QuestionCardSchema, AnswerCardSchema} from "./Card";

export class AnswerCardsArraySchema extends Schema {
  @type([AnswerCardSchema]) cards = new ArraySchema<AnswerCardSchema>();
}

export class RoundSchema extends Schema {
  @type(QuestionCardSchema) questionCard = new QuestionCardSchema();
  @type({ map: AnswerCardsArraySchema }) answerCards = new MapSchema<AnswerCardsArraySchema>();
  @type("string") judge = "";
  @type("string") winner = "";
  @type(["string"]) revealedCards = new ArraySchema<string>();
  @type("string") currentRevealedId = "";
  @type("boolean") allCardsRevealed = false;
}

export type TRound = typeof RoundSchema.prototype;

export function createEmptyRound(): RoundSchema {
  const round = new RoundSchema();
  round.questionCard = new QuestionCardSchema();
  round.answerCards = new MapSchema<AnswerCardsArraySchema>();
  round.judge = "";
  round.winner = "";
  round.revealedCards = new ArraySchema<string>();
  round.currentRevealedId = "";
  round.allCardsRevealed = false;
  return round;
}