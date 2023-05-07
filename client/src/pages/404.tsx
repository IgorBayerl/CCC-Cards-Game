import {
  createStyles,
  Image,
  Container,
  Title,
  Text,
  Button,
  SimpleGrid,
  rem,
} from '@mantine/core'
import Link from 'next/link'
import Layout from '~/components/Atoms/Layout'

const useStyles = createStyles((theme) => ({
  title: {
    fontWeight: 900,
    fontSize: rem(34),
    marginBottom: theme.spacing.md,
    fontFamily: theme.fontFamily,

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(32),
    },
  },

  control: {
    [theme.fn.smallerThan('sm')]: {
      width: '100%',
    },
  },

  mobileImage: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  desktopImage: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },
}))

export default function NotFoundPage() {
  const { classes } = useStyles()

  return (
    <Layout>
      <Container>
        <SimpleGrid
          spacing={80}
          cols={2}
          breakpoints={[{ maxWidth: 'sm', cols: 1, spacing: 40 }]}
        >
          <Image
            src="/404_not_found.svg"
            className={classes.mobileImage}
            alt="404_not_found"
          />
          <div>
            <Title className={classes.title}>Something is not right...</Title>
            <Text color="dimmed" size="lg">
              Page you are trying to open does not exist. You may have mistyped
              the address, or the page has been moved to another URL. If you
              think this is an error contact support.
            </Text>
            <Link href="/">
              <Button
                variant="outline"
                size="md"
                mt="xl"
                className={classes.control}
              >
                Get back to home page
              </Button>
            </Link>
          </div>
          <Image
            src="/404_not_found.svg"
            className={classes.desktopImage}
            alt="404_not_found"
          />
        </SimpleGrid>
      </Container>
    </Layout>
  )
}
