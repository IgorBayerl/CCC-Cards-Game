// shared/types.ts

export enum MessageType {
  ADMIN_START = "admin:start",
  ADMIN_NEXT_ROUND = "admin:next-round",
  ADMIN_END = "admin:end",
  ADMIN_START_NEW_GAME = "admin:start-new-game",
  ADMIN_BACK_TO_LOBBY = "admin:back-to-lobby",
  ADMIN_KICK_PLAYER = "admin:kick-player",
  SET_CONFIG = "game:setConfig",
  PLAYER_SELECTION = "game:playerSelection",
  REQUEST_NEXT_CARD = "game:requestNextCard",
  SEE_ALL_ROUND_ANSWERS = "game:seeAllRoundAnswers",
  JUDGE_DECISION = "game:judgeDecision",
}


export type SetConfigPayload = RoomConfig;

export type PlayerSelectionPayload = {
  selection: string[];
};

export type RequestNextCardPayload = {
  playerId: string;
};

export type SeeAllRoundAnswersPayload = {
  playerId: string;
};

export type JudgeDecisionPayload = {
  playerId: string;
  decision: boolean;
};

export type AdminKickPlayerPayload = {
  playerId: string;
};

export type GameMessagePayloads = {
  [MessageType.ADMIN_START]: null;
  [MessageType.ADMIN_NEXT_ROUND]: null;
  [MessageType.ADMIN_END]: null;
  [MessageType.ADMIN_START_NEW_GAME]: null;
  [MessageType.ADMIN_BACK_TO_LOBBY]: null;
  [MessageType.ADMIN_KICK_PLAYER]: AdminKickPlayerPayload;
  [MessageType.SET_CONFIG]: SetConfigPayload;
  [MessageType.PLAYER_SELECTION]: PlayerSelectionPayload;
  [MessageType.REQUEST_NEXT_CARD]: RequestNextCardPayload;
  [MessageType.SEE_ALL_ROUND_ANSWERS]: SeeAllRoundAnswersPayload;
  [MessageType.JUDGE_DECISION]: JudgeDecisionPayload;
};


/// State types

export type RoomStatus = "waiting" | "starting" | "playing" | "judging" | "results" | "finished";

export interface MyRoomState {
  config: RoomConfig;
  players: Map<string, Player>;
  rounds: Round[];
  roomStatus: RoomStatus;
  judge: string;
  isJudgeSelected: boolean;
  currentQuestionCard: QuestionCard;
  isQuestionCardSelected: boolean;
  usedQuestionCards: QuestionCard[];
  usedAnswerCards: AnswerCard[];
  leader: string;
}

export interface RoomConfig {
  availableDecks: Deck[];
  scoreToWin: number;
  roundTime: number;
  roomSize: number;
}

// Card.ts

export interface Card {
  id: string;
  text: string;
}

export interface AnswerCard extends Card {}

export interface QuestionCard extends Card {
  spaces: number;
}

// Deck.ts

export interface Deck {
  id: string;
  title: string;
  language: string;
  description: string;
  darknessLevel: number;
  icon: string;
  questionCount: number;
  answerCount: number;
  selected: boolean;
}

// Player.ts

export type PlayerStatus = "judge" | "pending" | "done" | "none" | "winner" | "waiting";

export interface Player {
  id: string;
  username: string;
  pictureUrl: string;
  score: number;
  status: PlayerStatus;
  hasSubmittedCards: boolean;
  cards: AnswerCard[];
}

// Round.ts

export interface Round {
  questionCard: QuestionCard;
  answerCards: Map<string, AnswerCard[]>;
  judge: string;
  winner: string;
  judgeId: number;
}
