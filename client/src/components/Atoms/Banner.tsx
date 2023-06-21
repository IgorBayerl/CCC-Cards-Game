import { useEffect, useRef } from 'react'
export default function Banner(): JSX.Element {
  const banner = useRef<HTMLDivElement | null>(null)

  const atOptions = {
    key: '8fc0e4790d8173eaee59bfb8d2881922',
    format: 'iframe',
    height: 600,
    width: 160,
    params: {},
  }
  useEffect(() => {
    if (banner.current && !banner.current.firstChild) {
      const conf = document.createElement('script')
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `//www.highperformancedformats.com/${atOptions.key}/invoke.js`
      conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`

      banner.current.append(conf)
      banner.current.append(script)
    }
  }, [banner])

  return (
    <div
      className="mx-2 my-5 hidden items-center justify-center border border-gray-200 text-center text-white md:block"
      ref={banner}
    ></div>
  )
}
