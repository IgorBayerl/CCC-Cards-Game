import Script from 'next/script'
import { GA_TRACKING_ID } from '~/lib/gtag' 

export default function TrackingCode(): JSX.Element {
  return (
    <>
      <Script
        strategy="lazyOnload"
        id="google-analytics"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3354864508700429"
        crossOrigin="anonymous"
      />
      <Script
        strategy="lazyOnload"
        id="google-tag-manager"
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-tag-manager-init"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', ${GA_TRACKING_ID});
            `,
        }}
      />
      {/* <Script
        id="adsterra"
        dangerouslySetInnerHTML={{
          __html: `
            atOptions = {
              'key' : '8fc0e4790d8173eaee59bfb8d2881922',
              'format' : 'iframe',
              'height' : 600,
              'width' : 160,
              'params' : {}
            };
            document.write('<scr' + 'ipt type="text/javascript" src="http' + (location.protocol === 'https:' ? 's' : '') + '://www.profitabledisplaynetwork.com/8fc0e4790d8173eaee59bfb8d2881922/invoke.js"></scr' + 'ipt>');
        `,
        }}
      /> */}
    </>
  )
}
