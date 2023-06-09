// src/Deck.ts

export interface IDecksConfigScreen {
  decks: IDeckConfigScreen[]
}

export interface IDeckConfigScreen {
  id: string
  name: string
  language: string
  description: string
  category: string
  icon: string
  questions: number
  answers: number
  selected?: boolean
}

export interface IDecks {
  decks: IDeck[]
}

export interface IDeck {
  id: string
  name: string
  description: string
  language: string
  cards: {
    questions: ICardQuestion[]
    answers: ICardAnswer[]
  }
}

export interface ICard {
  text: string
}

export interface ICardQuestion extends ICard {
  spaces: number
}



export interface ICardAnswer extends ICard {}