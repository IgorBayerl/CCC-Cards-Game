// shared/types.ts

export enum MessageType {
  ADM_COMMAND = "game:admCommand",
  SET_CONFIG = "game:setConfig",
  PLAYER_SELECTION = "game:playerSelection",
  REQUEST_NEXT_CARD = "game:requestNextCard",
  SEE_ALL_ROUND_ANSWERS = "game:seeAllRoundAnswers",
  JUDGE_DECISION = "game:judgeDecision",
}

export type AdmCommand =
  | 'start'
  | 'next-round'
  | 'end'
  | 'start-new-game'
  | 'back-to-lobby'

// BUG define those types correctly
export type AdmCommandPayload = { 
  command: AdmCommand,
  value: any 
};

export type SetConfigPayload = RoomConfig

export type PlayerSelectionPayload = { 
  selection: string[],
};

export type RequestNextCardPayload = { 
  playerId: string 
};

export type SeeAllRoundAnswersPayload = { 
  playerId: string 
};

export type JudgeDecisionPayload = { 
  playerId: string, 
  decision: boolean 
};

export type GameMessagePayloads = {
  [MessageType.ADM_COMMAND]: AdmCommandPayload;
  [MessageType.SET_CONFIG]: SetConfigPayload;
  [MessageType.PLAYER_SELECTION]: PlayerSelectionPayload;
  [MessageType.REQUEST_NEXT_CARD]: RequestNextCardPayload;
  [MessageType.SEE_ALL_ROUND_ANSWERS]: SeeAllRoundAnswersPayload;
  [MessageType.JUDGE_DECISION]: JudgeDecisionPayload;
}



/// State types
// Room.ts

export type RoomStatus = "waiting" | "starting" | "playing" | "judging" | "results" | "finished";

export interface MyRoomState {
  config: RoomConfig;
  // players: Record<string, Player>;
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
