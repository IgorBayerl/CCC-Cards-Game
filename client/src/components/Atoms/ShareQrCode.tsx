import { QrCode } from '@phosphor-icons/react';

interface IShareQrCodeProps {
  content: string;
  onOpenDrawer: () => void; 
}

export function ShareQrCode({ onOpenDrawer }: IShareQrCodeProps) {
  return (
    <button
      className="btn-outline btn-accent btn"
      onClick={onOpenDrawer} 
    >
      <QrCode size={25} />
    </button>
  );
}
