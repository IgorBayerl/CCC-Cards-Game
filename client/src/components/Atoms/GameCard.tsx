import { createStyles } from '@mantine/core'
import { classNames } from '~/lib/utils'
import { ICard, ICardQuestion } from '~/models/Deck'

interface IGameCardProps {
  cardInfo: ICardQuestion | ICard
  selected: boolean
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
}))

export default function GameCard({ cardInfo, selected }: IGameCardProps) {
  const isQuestion = 'spaces' in cardInfo
  const { classes } = useStyles()

  const cardStyles = classNames(
    classes.container,
    isQuestion ? classes.questionCard : classes.answerCard,
    selected ? classes.cardSizePortraitSelected : classes.cardSizePortrait,
    selected ? classes.cardBorder : ''
  )

  const { id, text } = cardInfo
  return (
    <div className={cardStyles}>
      {/* <div>{id}</div> */}
      <div>{text}</div>
    </div>
  )
}
