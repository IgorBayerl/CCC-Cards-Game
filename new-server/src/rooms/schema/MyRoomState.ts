import {Schema, Context, type, MapSchema, ArraySchema} from "@colyseus/schema";
import {AnswerCardSchema, QuestionCardSchema} from "./Card";
import {RoomConfigSchema} from "./Config";
import {PlayerSchema} from "./Player";
import {RoundSchema} from "./Round";


export type RoomStatus =
  | "waiting"
  | "starting"
  | "playing"
  | "judging"
  | "results"
  | "finished";

export class MyRoomState extends Schema {
  //lobby config states
  @type(RoomConfigSchema) config = new RoomConfigSchema();

  //game states
  @type({map: PlayerSchema}) players = new MapSchema<PlayerSchema>();
  @type([RoundSchema]) rounds = new ArraySchema<RoundSchema>();
  @type("string") roomStatus: RoomStatus = "waiting";

  @type("string") judge = "";

  @type("boolean") isJudgeSelected = false;

  @type(QuestionCardSchema) currentQuestionCard = new QuestionCardSchema();
  @type("boolean") isQuestionCardSelected = false;

  @type([QuestionCardSchema]) usedQuestionCards = new ArraySchema<QuestionCardSchema>();
  @type([AnswerCardSchema]) usedAnswerCards = new ArraySchema<AnswerCardSchema>();

  @type("string") leader = "";
}

export type TMyRoomState = typeof MyRoomState.prototype;
