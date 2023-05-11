export interface IDeckConfigScreen {
  id: string
  name: string
  description: string
  language: string
  selected?: boolean
}

export interface IDeck {
  id: string
  name: string
  description: string
  language: string
  cards: ICard[]
}

export interface ICard {
  id: string
  text: string
}

export interface ICardQuestion extends ICard {
  spaces: number
}
