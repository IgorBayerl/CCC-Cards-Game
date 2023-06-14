import type { AxiosRequestConfig } from 'axios'
import type { IDeckConfigScreen } from '~/models/Deck'
import api from '~/services/api'

interface IDecksQuery {
  language?: string
  category?: number
}

type Params = {
  language?: string
  category?: number
}

export const getDecks = async (
  query: IDecksQuery
): Promise<Array<IDeckConfigScreen>> => {
  const { language, category } = query
  const params: Params = {}

  if (language !== undefined) {
    params['language'] = language
  }

  if (category !== undefined) {
    params['category'] = category
  }

  const response = await api.get<Array<IDeckConfigScreen>>('/decks', {
    params,
  })
  return response.data
}
