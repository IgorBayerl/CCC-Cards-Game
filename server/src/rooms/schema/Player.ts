// src/rooms/GamePlayer.ts
import {Schema, type, ArraySchema} from "@colyseus/schema";
import {AnswerCard} from "@ccc-cards-game/types";
import {AnswerCardSchema} from "./Card";
import logger from "../../lib/loggerConfig";

export type TPlayerStatus = "judge" | "pending" | "done" | "none" | "winner" | "waiting";

export class PlayerSchema extends Schema {
  @type("string") id: string = "";
  @type("string") username: string = "";
  @type("string") pictureUrl: string = "";
  @type("number") score = 0;
  @type("string") status: TPlayerStatus = "pending";
  @type("boolean") hasSubmittedCards: boolean = false;
  @type([AnswerCardSchema]) cards = new ArraySchema<AnswerCardSchema>();
  @type("boolean") isOffline: boolean = false;
  @type("boolean") isBot: boolean = false;
  @type("boolean") isWaitingForNextRound: boolean = false;

  /**
   * Timeout will only be used when disconnecting in the lobby, not mid game.
   */
  private _timeout?: NodeJS.Timeout = undefined;

  public addPoint() {
    this.score++;
  }

  public resetScore() {
    this.score = 0;
  }

  public resetPlayer() {
    this.resetScore();
    this.cards.clear();
    this.status = "pending";
    this.hasSubmittedCards = false;
    this.isOffline = false;
    this.isBot = false;
    this.isWaitingForNextRound = false;
  }

  public setAsOffline() {
    this.isOffline = true;
    this.isBot = false;
    this.isWaitingForNextRound = false;

    logger.info(`Player ${this.username} is offline`);
  }

  public transformIntoBot() {
    this.isOffline = true;
    this.isBot = true;
    this.isWaitingForNextRound = false;

    logger.info(`Player ${this.username} is bot`);
  }

  public transformFromBot() {
    this.isOffline = false;
    this.isBot = false;
    this.isWaitingForNextRound = false;

    logger.info(`Player ${this.username} is back online`);
  }

  public reconnectAndWait() {
    this.isBot = false;
    this.isOffline = false;
    this.isWaitingForNextRound = true;

    logger.info(`Player ${this.username} is back online, waiting for next round.`);
  }

  public get isPlayerPlaying(): boolean {
    return (!this.isOffline || this.isBot) && !this.isWaitingForNextRound;
  }

  /**
   * Overwrite the cards that the player has in the hands
   * @param cards
   */
  public setCards(cards: ArraySchema<AnswerCardSchema>) {
    this.cards = cards;
  }

  /**
   * Add new cards to player hands, maintaining the ones that he already has
   * @param cardsToAdd
   */
  public addCardsToPlayerHand(cardsToAdd: AnswerCard[]) {
    const newCards: ArraySchema<AnswerCardSchema> = this.cards.concat(cardsToAdd as AnswerCardSchema[]);
    this.setCards(newCards);
  }

  /**
   * Remove specific cards from player hands
   * When the player make the choice of setting the cards, those cards should be removed from his hand.
   * @param cardsToRemove
   */
  public removeCardsFromPlayerHand(cardsToRemove: ArraySchema<AnswerCardSchema>) {
    const cardsToRemoveIds = cardsToRemove.map(card => card.id);
    const newCards: ArraySchema<AnswerCardSchema> = this.cards.filter(card => !cardsToRemoveIds.includes(card.id));
    this.setCards(newCards);
  }

  /**
   * Used for the autoplay, when the of the round ends and you need to select some cards for the game to proceed.
   * Or when the player is in bot mode
   * @param count
   * @returns
   */
  public getRandomAnswers(count: number): ArraySchema<AnswerCardSchema> {
    const randomAnswers: ArraySchema<AnswerCardSchema> = new ArraySchema<AnswerCardSchema>();
    const availableIndices: number[] = [...Array(this.cards.length).keys()]; // Create an array of available indices

    for (let i = 0; i < count; i++) {
      if (availableIndices.length === 0) {
        // If no more available indices, break the loop
        break;
      }

      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      const selectedIndex = availableIndices.splice(randomIndex, 1)[0]; // Remove the selected index from availableIndices
      randomAnswers.push(this.cards[selectedIndex]);
    }
    return randomAnswers;
  }

  public setStatus(status: TPlayerStatus) {
    this.status = status;
  }

  /**
   * When the player reconnects, essentially he will be a new player with the same data as the previous player.
   */
  public cloneFrom(otherPlayer: PlayerSchema) {
    this.username = otherPlayer.username;
    // this.pictureUrl = otherPlayer.pictureUrl;
    this.score = otherPlayer.score;
    this.status = otherPlayer.status;
    this.hasSubmittedCards = otherPlayer.hasSubmittedCards;
    this.cards = otherPlayer.cards;
    this.isOffline = false;
    this.isBot = false;

    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }
}

export type TPlayer = typeof PlayerSchema.prototype;
