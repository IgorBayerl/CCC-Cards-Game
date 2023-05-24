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
  text: string
}

export interface ICardQuestion extends ICard {
  spaces: number
}

// I tried to extend the ICard with no changes, but the vercel build failed (this is just to get a more descriptive name)
export interface ICardAnswer {
  text: string
}