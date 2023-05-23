import { createStyles } from '@mantine/core'
import React from 'react'
import { classNames } from '~/lib/utils'
import { ICard, ICardQuestion } from '~/models/Deck'

interface IGameCardProps {
  cardInfo: ICardQuestion | ICard
  selected?: boolean
  onClick?: () => void
  number?: number
}

const useStyles = createStyles((theme) => ({
  container: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    transition: 'transform 0.2s ease-in-out',
  },
  questionCard: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.red[4] : theme.colors.red[6],
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[9]
        : theme.colors.gray[9],
  },
  answerCard: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.teal[4]
        : theme.colors.teal[6],
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[9]
        : theme.colors.gray[9],
  },
  cardSizePortrait: {
    width: 130,
    aspectRatio: '3/4',
  },
  cardSizePortraitSelected: {
    width: 200,
    aspectRatio: '3/4',
  },
  cardBorder: {
    border: `2px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]
    }`,
  },
  selectedCard: {
    border: `2px solid ${theme.colors.blue[6]}`,
    transform: 'scale(1.1)',
  },
  orderCircle: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    height: 20,
    width: 20,
    borderRadius: '50%',
    backgroundColor: theme.colors.blue[6],
    color: theme.colors.gray[0],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.fontSizes.sm,
  },
  highlight: {
    color: theme.colors.blue[6], // replace with your desired color
  },
}))

export default function GameCard({
  cardInfo,
  selected = false,
  onClick,
  number,
}: IGameCardProps) {
  const isQuestion = 'spaces' in cardInfo
  const { classes } = useStyles()

  const cardStyles = classNames(
    classes.container,
    isQuestion ? classes.questionCard : classes.answerCard,
    classes.cardSizePortrait,
    selected ? classes.selectedCard : ''
  )

  const { id, text } = cardInfo
  return (
    <div className={cardStyles} onClick={onClick}>
      {selected && <div className={classes.orderCircle}>{number}</div>}
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

  const { classes } = useStyles()
  const processedQuestion = question.split('___').map((part, index) => {
    const iteratorResult = answersIterator.next()
    if (!iteratorResult.done) {
      const answer = iteratorResult.value
      return (
        <React.Fragment key={index}>
          {part}
          <span className={classes.highlight}>{answer}</span>
        </React.Fragment>
      )
    }
    return part
  })

  const cardStyles = classNames(
    classes.container,
    classes.answerCard,
    classes.cardSizePortrait
  )

  return (
    <div className={cardStyles}>
      <p>{processedQuestion}</p>
    </div>
  )
}


