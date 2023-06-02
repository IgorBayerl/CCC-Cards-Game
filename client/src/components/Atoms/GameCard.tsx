import React from 'react'
import { classNames } from '~/lib/utils'
import { ICard, ICardQuestion } from '~/models/Deck'

interface IGameCardProps {
  cardInfo: ICardQuestion | ICard
  selected?: boolean
  onClick?: () => void
  number?: number
}

export default function GameCard({
  cardInfo,
  selected = false,
  onClick,
  number,
}: IGameCardProps) {
  const isQuestion = 'spaces' in cardInfo

  const cardStyles = classNames(
    isQuestion ? 'bg-red-200' : 'bg-blue-200',
    selected ? 'border-2 border-primary' : ''
  )

  const { text } = cardInfo
  return (
    <div className={cardStyles} onClick={onClick}>
      {selected && <div className="h-10 w-10 rounded-full">{number}</div>}
      {/* <div>{id}</div> */}
      <div>{text}</div>
    </div>
  )
}

interface IGameCardResultProps {
  question: string
  answers: string[]
}

export const GameCardResult: React.FC<IGameCardResultProps> = ({
  question,
  answers,
}) => {
  const answersIterator: Iterator<string> = answers[Symbol.iterator]()

  const processedQuestion = question.split('___').map((part, index) => {
    const iteratorResult = answersIterator.next()
    if (!iteratorResult.done) {
      const answer = iteratorResult.value
      return (
        <React.Fragment key={index}>
          {part}
          <span className="text-blue-600">{answer}</span>
        </React.Fragment>
      )
    }
    return part
  })

  return (
    <div className="">
      <p>{processedQuestion}</p>
    </div>
  )
}
