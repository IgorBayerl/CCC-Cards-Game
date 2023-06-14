import fs from 'fs'
import path from 'path'
import { IDeck } from '../models/Deck'

const decksDirectory = path.join(__dirname, '../data/decks')
const deckFiles = fs.readdirSync(decksDirectory)

export const decks = deckFiles.map((file) => {
  const deck = JSON.parse(
    fs.readFileSync(path.join(decksDirectory, file), 'utf-8')
  )
  const [language, _rest, id] = file.split('_')
  deck.id = id.split('.')[0] // remove .json extension
  deck.language = language
  return deck
})

export function getDeckById(id: string): IDeck | undefined {
  // Find a file that matches the id
  const decksDirectory = path.join(__dirname, '../data/decks')
  const deckFiles = fs.readdirSync(decksDirectory)
  const deckFile = deckFiles.find((file) => file.includes(id))

  if (!deckFile) return undefined

  const deck = JSON.parse(
    fs.readFileSync(path.join(decksDirectory, deckFile), 'utf-8')
  )

  // Assuming that id and language are included in the file name, but not in the file content
  const [language, _rest, fileId] = deckFile.split('_')
  deck.id = fileId.split('.')[0] // remove .json extension
  deck.language = language

  return deck
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

interface IDecksQuery {
  language?: string
  category?: number
}

interface IListDecks {
  id: string
  name: string
  language: string
  description: string
  category: number
  icon: string
  questions: number
  answers: number
}

export function summaryDecks(): IListDecks[] {
  return decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    language: deck.language,
    description: deck.description,
    category: deck.category || 0,
    icon: deck.icon || '📚',
    questions: deck.cards.questions.length || 0,
    answers: deck.cards.answers.length || 0,
  }))
}

export function listDecks({ language, category }: IDecksQuery): IListDecks[] {
  const hasLanguage = language !== undefined
  const hasCategory = category !== undefined

  let filteredDecks = summaryDecks()
  if (!hasLanguage && !hasCategory) {
    return filteredDecks
  }

  if (hasLanguage) {
    filteredDecks = filteredDecks.filter((deck) => deck.language === language)
  }

  /**
   * Category will filter by the category and all decks that have lower categories
   * For example, if the category is 2, it will return all decks that have category 2, 1 and 0
   */
  if (hasCategory) {
    filteredDecks = filteredDecks.filter((deck) => deck.category <= category)
  }

  return filteredDecks
}