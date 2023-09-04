import extractErrorMessage from '~/lib/extractErrorMessage'
import {
  DeckFilters,
  FetchDeckResponse,
  FetchLanguages,
} from '~/models/ApiRequests'
import api from '~/services/api'

export async function fetchDecks(
  filters: DeckFilters
): Promise<FetchDeckResponse> {
  try {
    const response = await api.post('/decks', filters)
    return response.data
  } catch (error) {
    const errorMessage = extractErrorMessage(error)
    throw new Error(
      `An error occurred while fetching the deck: ${errorMessage}`
    )
  }
}

export async function fetchLanguages(): Promise<FetchLanguages> {
  try {
    const response = await api.get('/decks/languages')
    return response.data.data
  } catch (error) {
    const errorMessage = extractErrorMessage(error)
    throw new Error(
      `An error occurred while fetching languages: ${errorMessage}`
    )
  }
}
