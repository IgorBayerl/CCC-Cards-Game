import {
  useMantineColorScheme,
  SegmentedControl,
  Group,
  Center,
  Box,
} from '@mantine/core'
import { IconSun, IconMoon } from '@tabler/icons-react'

export function ThemeSwitcher() {
  /* eslint-disable-next-line @typescript-eslint/unbound-method */
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  const handleColorSchemeChange = (value: 'light' | 'dark') => {
    toggleColorScheme(value)
  }

  return (
    <Group position="center" my="xl">
      <SegmentedControl
        value={colorScheme}
        onChange={handleColorSchemeChange}
        data={[
          {
            value: 'light',
            label: (
              <Center>
                <IconSun size="1rem" stroke={1.5} />
                <Box ml={10}>Light</Box>
              </Center>
            ),
          },
          {
            value: 'dark',
            label: (
              <Center>
                <IconMoon size="1rem" stroke={1.5} />
                <Box ml={10}>Dark</Box>
              </Center>
            ),
          },
        ]}
      />
    </Group>
  )
}
