import Image from 'next/image'

export default function CCCIconThemed(): JSX.Element {
  return (
    <>
      <Image
        src="/icon_cyber_chaos_cards.svg"
        alt="cyber chaos cards icon"
        width={100}
        height={100}
        className="hidden dark:block"
      />
      <Image
        src="/icon_cyber_chaos_cards_dark.svg"
        alt="cyber chaos cards icon"
        width={100}
        height={100}
        className="dark:hidden"
      />
    </>
  )
}
