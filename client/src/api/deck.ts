import { type IDeckConfigScreen } from '~/models/Deck'
import api from '~/services/api'

export const getDecks = async (): Promise<Array<IDeckConfigScreen>> => {
  const response = await api.get<Array<IDeckConfigScreen>>('/decks')
  return response.data
}
