import { Schema, Context, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { AnswerCardSchema, QuestionCardSchema } from "./Card";
import { Player } from "./Player";
import { RoundSchema } from "./Round";


export class MyRoomState extends Schema {
  //lobby config states
  @type(["string"]) availableDecks = new ArraySchema<string>();
  @type("number") scoreToWin = 0;
  @type("number") roundTime = 0;
  @type("number") roomSize = 0;

  //game states
  @type({ map: Player }) players = new MapSchema<Player>();
  @type([RoundSchema]) rounds = new ArraySchema<RoundSchema>();
  @type("string") roomStatus = 'waiting';

  @type(Player) judge = new Player();
  @type("boolean") isJudgeSelected = false;

  @type(QuestionCardSchema) currentQuestionCard = new QuestionCardSchema();
  @type("boolean") isQuestionCardSelected = false;
  
  // instead of tracking available cards, track used cards and the available decks
  @type([QuestionCardSchema]) usedQuestionCards = new ArraySchema<QuestionCardSchema>();
  @type([AnswerCardSchema]) usedAnswerCards = new ArraySchema<AnswerCardSchema>();
}
