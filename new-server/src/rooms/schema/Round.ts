import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { QuestionCardSchema, AnswerCardSchema } from "./Card";
import { Player } from "./Player";

class AnswerCardArray extends Schema {
  @type([AnswerCardSchema]) cards = new ArraySchema<AnswerCardSchema>();
}

export class RoundSchema extends Schema {
  @type(QuestionCardSchema) questionCard = new QuestionCardSchema();
  @type({ map: AnswerCardArray }) answerCards = new MapSchema<AnswerCardArray>();
  @type(Player) judge = new Player();
  @type(Player) winner: Player | null = null;
  @type("number") currentJudgedPlayerIndex: number = 0;
}
