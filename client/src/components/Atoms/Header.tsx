import { useState } from 'react'

import ConnectionStatus from './ConnectionStatus'
import Image from 'next/image'
import Link from 'next/link'

interface HeaderSimpleProps {
  links: { link: string; label: string }[]
}

export function HeaderSimple({ links }: HeaderSimpleProps) {
  const [active, setActive] = useState(links[0]?.link)

  const items = links.map((link) => (
    <Link
      key={link.label}
      href={link.link}
      onClick={(event) => {
        event.preventDefault()
        setActive(link.link)
      }}
    >
      {link.label}
    </Link>
  ))

  return (
    <header>
      <div className="">
        <Image
          src="/logo_light.svg"
          alt="Cyber Chaos Cards logo"
          width={200}
          height={40}
        />

        <div className="">
          {items}

          <ConnectionStatus />
        </div>
      </div>
    </header>
  )
}
