import { useState } from 'react'
import { createStyles, Header, Container, Group, rem } from '@mantine/core'
import { ThemeSwitcher } from './ThemeSwitcher'
import ConnectionStatus from './ConnectionStatus'

const useStyles = createStyles((theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },

  links: {
    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },

  burger: {
    [theme.fn.largerThan('xs')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({
        variant: 'light',
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
        .color,
    },
  },
}))

interface HeaderSimpleProps {
  links: { link: string; label: string }[]
}

export function HeaderSimple({ links }: HeaderSimpleProps) {
  const [active, setActive] = useState(links[0]?.link)
  const { classes, cx } = useStyles()

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={cx(classes.link, {
        [classes.linkActive]: active === link.link,
      })}
      onClick={(event) => {
        event.preventDefault()
        setActive(link.link)
      }}
    >
      {link.label}
    </a>
  ))

  return (
    <Header height={60} mb={120}>
      <Container className={classes.header}>
        <div className="bg-red-200 px-2 py-1 text-xl">
          LOGO - Cyber Chaos Cards
        </div>

        <Group spacing={5} className={classes.links}>
          {items}

          <ConnectionStatus />
          <ThemeSwitcher />
        </Group>
      </Container>
    </Header>
  )
}
