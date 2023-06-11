import Document, { Head, Html, Main, NextScript } from 'next/document'

export default class _Document extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body 
          className='dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-600 bg-gradient-to-r from-emerald-400 to-cyan-400' 
          // linear-gradient(200deg,#5c1ea6 0%,rgba(200,67,94,1) 100%)
        //  style={{
        //   backgroundImage: 'linear-gradient(200deg, #2f6cc9 0%, #f16320 100%)'
        //  }}
        >
          <div
           style={{
            backgroundImage: `url("/texture.png")`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'difference',
          }}
          >
            <Main />
            <NextScript />

          </div>
        </body>
      </Html>
    )
  }
}
