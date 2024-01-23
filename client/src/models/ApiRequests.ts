import { type DeckData, type DeckFilters } from '@ccc-cards-game/types'
import { type ServerResponse } from './Generics'

// export type DeckFilters = {
//   darknessLevel: number[]
//   language: string[]
//   title: string
// }

// export type DeckSummary = {
//   decks: number
//   questions: number
//   answers: number
// }

// export type Deck = {
//   id: string
//   title: string
//   description: string
//   darknessLevel: number
//   icon: string
//   questionCount: number
//   answerCount: number
//   language: string
// }

// export type DeckData = {
//   summary: DeckSummary
//   decks: Deck[]
// }

export type FetchDeckResponse = ServerResponse<DeckData, DeckFilters>

export type FetchLanguages = ServerResponse<string[], null>
