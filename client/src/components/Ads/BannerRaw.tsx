import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'
import classNames from 'classnames'

interface BannerRawProps {
  height: number
  width: number
  adKey: string
  className: string
}

const BannerRaw: React.FC<BannerRawProps> = ({
  height,
  width,
  adKey,
  className,
}) => {
  const banner = useRef<HTMLDivElement | null>(null)
  const [isAdBlocked, setIsAdBlocked] = useState(false)
  const { t } = useTranslation('common')

  const atOptions = {
    key: adKey,
    format: 'iframe',
    height: height,
    width: width,
    params: {},
  }
  useEffect(() => {
    if (banner.current && !banner.current.firstChild) {
      const conf = document.createElement('script')
      const script = document.createElement('script')
      script.onerror = () => setIsAdBlocked(true)
      script.type = 'text/javascript'
      script.src = `//www.highperformancedformats.com/${atOptions.key}/invoke.js`
      conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`

      banner.current.append(conf)
      banner.current.append(script)
    }
  }, [banner])

  const isHorizontal = width > height

  const imageStyle = classNames('w-full', isHorizontal ? 'hidden' : 'block')

  return (
    <div
      className={className}
      ref={banner}
      style={{ height: `${height}px`, width: `${width}px` }}
    >
      {isAdBlocked && (
        <div className="flex h-full flex-col items-center justify-center">
          <p className=" text-center text-lg font-bold">
            {t('i-disable-ad-blocker')}
          </p>
          <Image
            src="/crying_jordan.png"
            width="100"
            height="100"
            alt="crying jordan"
            objectFit="fill"
            className={imageStyle}
          />
        </div>
      )}
    </div>
  )
}

export default BannerRaw
