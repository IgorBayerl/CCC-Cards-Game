import { IDeck } from '../models/Deck'
import decks from '../data/decks.json'

export function getDeckById(id: string): IDeck | undefined {
  return decks.find((d) => d.id === id)
}

/**
 * This function uses the Fisher-Yates (aka Knuth) Shuffle algorithm to randomly shuffle an array.
 *
 * How it works:
 * 1. It starts from the last element of the array and goes backwards. This element is considered as the "current element".
 * 2. It picks a random index from the remaining unprocessed elements (including the current one).
 * 3. It then swaps the current element with the randomly selected element.
 * 4. It moves to the previous element and repeats the process until all elements are processed (i.e., until it reaches the first element).
 *
 * This way, every permutation of the array is equally likely. It is an unbiased algorithm, providing a completely random shuffling.
 *
 * @param cards - The array of cards to shuffle
 * @return The shuffled array of cards
 */
export function shuffleCards(cards: any[]) {
  let currentIndex = cards.length // Starting from the last element
  let randomIndex

  while (currentIndex !== 0) {
    // While there remain elements to shuffle
    randomIndex = Math.floor(Math.random() * currentIndex) // Pick a remaining element
    currentIndex-- // Reduce the range of remaining elements by 1
    // And swap it with the current element
    ;[cards[currentIndex], cards[randomIndex]] = [
      cards[randomIndex],
      cards[currentIndex],
    ]
  }

  return cards // Return the shuffled array
}
