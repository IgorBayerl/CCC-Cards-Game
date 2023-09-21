// src/rooms/GamePlayer.ts
import {Schema, type, ArraySchema} from "@colyseus/schema";
import {AnswerCard} from "../../../shared/types";
import {AnswerCardSchema} from "./Card";

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

  private _timeout?: NodeJS.Timeout = undefined;

  public addPoint() {
    this.score++;
  }

  public setCards(cards: ArraySchema<AnswerCardSchema>) {
    this.cards = cards;
  }

  public addCardsToPlayerHand(cardsToAdd: AnswerCard[]) {
    const newCards: ArraySchema<AnswerCardSchema> = this.cards.concat(cardsToAdd as AnswerCardSchema[]);
    this.setCards(newCards);
  }

  public removeCardsFromPlayerHand(cardsToRemove: ArraySchema<AnswerCardSchema>) {
    const cardsToRemoveIds = cardsToRemove.map(card => card.id);
    const newCards: ArraySchema<AnswerCardSchema> = this.cards.filter(card => !cardsToRemoveIds.includes(card.id));
    this.setCards(newCards);
  }

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

  public cloneFrom(otherPlayer: PlayerSchema) {
    this.username = otherPlayer.username;
    // this.pictureUrl = otherPlayer.pictureUrl;
    this.score = otherPlayer.score;
    this.status = otherPlayer.status;
    this.hasSubmittedCards = otherPlayer.hasSubmittedCards;
    this.cards = otherPlayer.cards;
    this.isOffline = false;

    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }
}

export type TPlayer = typeof PlayerSchema.prototype;
