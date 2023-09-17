import {Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import {QuestionCardSchema, AnswerCardSchema} from "./Card";
import {PlayerSchema} from "./Player";

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


// const answerCards = {
//   "zL8EgMnHq":[
//     {
//       "id":"5bfb3022-8729-4c7d-8f00-7d0d3c9aa8e5",
//       "text":"Capitão Planeta"
//     }
//   ],
//   "8m0XJooK5":[
//     {
//     "id":"b3bcd2e6-afbe-40f4-b74f-bdba03b57926",
//     "text":"Brutalidade policial"
//     }
//   ]
// }