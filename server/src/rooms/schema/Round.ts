import {Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import {QuestionCardSchema, AnswerCardSchema} from "./Card";

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

  /**
   * Replaces a player's ID in the answerCards map with a new ID.
   * This method is used to handle the case where a player reconnects to the game and is assigned a new ID,
   * ensuring that their previously submitted answer cards are preserved and associated with their new ID.
   * 
   * @param oldId The player's old ID.
   * @param newId The player's new ID.
   */
  public replacePlayerId(oldId: string, newId: string): void {
    // Replace the id on judge
    if (this.judge === oldId) {
      this.judge = newId;
    }

    // Replace the id on winner
    if (this.winner === oldId) {
      this.winner = newId;
    }

    // Replace the id on answerCards
    const playerCards = this.answerCards.get(oldId);
    if (playerCards) {
      // Remove the entry with the old ID
      this.answerCards.delete(oldId);
      // Add a new entry with the new ID and the previously submitted answer cards
      this.answerCards.set(newId, playerCards);
    }
  }
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