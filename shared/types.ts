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
  JUDGE_DECISION = "game:judgeDecision",
  DEV_SAVE_SNAPSHOT = "dev:saveSnapshot",
  DEV_LOAD_SNAPSHOT = "dev:loadSnapshot",
}


export type SetConfigPayload = RoomConfig;

export type PlayerSelectionPayload = {
  selection: AnswerCard[];
};

export type RequestNextCardPayload = {
  playerId: string;
};

export type SeeAllRoundAnswersPayload = {
  playerId: string;
};

export type JudgeDecisionPayload = {
  winner: string;
}

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
  [MessageType.JUDGE_DECISION]: JudgeDecisionPayload;
  [MessageType.DEV_SAVE_SNAPSHOT]: null;
  [MessageType.DEV_LOAD_SNAPSHOT]: null;
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
  isOffline: boolean;
}

// Round.ts

export interface AnswerCardCollection {
  cards: AnswerCard[];
}

export interface Round {
  questionCard: QuestionCard;
  answerCards: Map<string, AnswerCardCollection>;
  judge: string;
  winner: string;
  revealedCards: string[];
  currentRevealedId: string;
  allCardsRevealed: boolean;
}



// Rest request types of lobby
export type DeckData = {
  summary: DeckSummary
  decks: Deck[]
}

export type DeckFilters = {
  darknessLevel: number[]
  language: string[]
  title: string
}

export type DeckSummary = {
  decks: number
  questions: number
  answers: number
}
