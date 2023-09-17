// src/rooms/GamePlayer.ts
import {Schema, type, ArraySchema} from "@colyseus/schema";
import {type Client} from "colyseus";
import {AnswerCard} from "../../../shared/types";
import {AnswerCardSchema} from "./Card";
import {DeckSchema} from "./Deck";

export type TPlayerStatus = "judge" | "pending" | "done" | "none" | "winner" | "waiting";

export class PlayerSchema extends Schema {
  @type("string") id: string = "";
  @type("string") username: string = "";
  @type("string") pictureUrl: string = "";
  @type("number") score = 0;
  @type("string") status: TPlayerStatus = "pending";
  @type("boolean") hasSubmittedCards: boolean = false;
  @type([AnswerCardSchema]) cards = new ArraySchema<AnswerCardSchema>();

  private _timeout?: NodeJS.Timeout;

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

  // /**
  //  * In this method we will tell how many cards the player should have in the hand, and the decks he can get cards from
  //  * We have a helper method that we can call with the decks and it returns one card from a random deck TODO: make this method
  //  * @param targetCardsCount is the number of cards the player should have in the hand
  //  * @param decks is the decks the player can get cards from
  //  */
  // public getCards(targetCardsCount: number, decks: ArraySchema<DeckSchema>) {
  //   // If the player already has the target number of cards, return
  //   if (this.cards.length === targetCardsCount) return;

  //   // If the player has more cards than the target number, remove the extra cards
  //   if (this.cards.length > targetCardsCount) {
  //     this.cards.splice(targetCardsCount, this.cards.length - targetCardsCount);
  //     return;
  //   }

  //   // If the player has less cards than the target number, add cards until the target number is reached
  //   while (this.cards.length < targetCardsCount) {
  //     this.cards.push(this.getRandomCard(decks));
  //   }
  // }

  // /**
  //  * This method returns a random card from the decks passed as argument
  //  * And add the card id to the usedCards array
  //  * @param decks
  //  */
  // private getRandomCard(decks: ArraySchema<DeckSchema>): AnswerCardSchema {
  //   // Get a random deck from the decks array
  // }

  public setStatus(status: TPlayerStatus) {
    this.status = status;
  }
}

export type TPlayer = typeof PlayerSchema.prototype;
