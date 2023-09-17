import extractErrorMessage from '~/lib/extractErrorMessage'
import { type FetchDeckResponse, type FetchLanguages } from '~/models/ApiRequests'
import { type DeckFilters } from '~/types'
import api from '~/services/api'

export async function fetchDecks(filters: DeckFilters) {
  try {
    const response = await api.post<FetchDeckResponse>('/decks', filters)
    return response.data
  } catch (error) {
    const errorMessage = extractErrorMessage(error)
    throw new Error(`An error occurred while fetching the deck: ${errorMessage}`)
  }
}

export async function fetchLanguages() {
  try {
    const response = await api.get<FetchLanguages>('/decks/languages')
    return response.data.data
  } catch (error) {
    const errorMessage = extractErrorMessage(error)
    throw new Error(`An error occurred while fetching languages: ${errorMessage}`)
  }
}
