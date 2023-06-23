import Document, { Head, Html, Main, NextScript } from 'next/document'

export default class _Document extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <body className="bg-gradient-to-br from-[#56126a] to-[#a22744]">
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
