import Script from 'next/script'

export default function TrackingCode(): JSX.Element {
  return (
    <>
      <Script
        id="google-analytics"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3354864508700429"
        crossOrigin="anonymous"
      />
      <Script
        id="google-tag-manager"
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-TB0SDCXYQY"
      />
      <Script
        id="google-tag-manager-init"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TB0SDCXYQY');
            `,
        }}
      />
    </>
  )
}
