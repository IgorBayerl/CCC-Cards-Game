import { createStyles } from '@mantine/core'
import { classNames } from '~/lib/utils'
import { ICard, ICardQuestion } from '~/models/Deck'

interface IGameCardProps {
  cardInfo: ICardQuestion | ICard
  selected: boolean
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
}))

export default function GameCard({
  cardInfo,
  selected,
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
