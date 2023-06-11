interface IBgImageProps {
  children: JSX.Element | JSX.Element[];
  url: string;
}

export default function BgImage({children, url}:IBgImageProps):JSX.Element {
  return (
  <div style={{ 
    backgroundImage: `url("${url}")` 
  }}>
    {children}
  </div>)
}