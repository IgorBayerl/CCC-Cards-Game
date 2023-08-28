import {Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import {QuestionCardSchema, AnswerCardSchema} from "./Card";
import {PlayerSchema} from "./Player";

class AnswerCardArray extends Schema {
  @type([AnswerCardSchema]) cards = new ArraySchema<AnswerCardSchema>();
}

export class RoundSchema extends Schema {
  @type(QuestionCardSchema) questionCard = new QuestionCardSchema();
  @type({map: AnswerCardArray}) answerCards = new MapSchema<AnswerCardArray>();
  @type("string") judge = "";
  @type("string") winner = "";
  @type("number") currentJudgedPlayerIndex: number = 0;
}

export type TRound = typeof RoundSchema.prototype;

export function createEmptyRound(): RoundSchema {
  const round = new RoundSchema();
  round.questionCard = new QuestionCardSchema();
  round.answerCards = new MapSchema<AnswerCardArray>();
  return round;
}
