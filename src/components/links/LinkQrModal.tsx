'use client';

import { useEffect, useState } from 'react';
import { generateQrDataUrl } from '@/lib/linkExtras';
import styles from '@/styles/LinkExtras.module.css';

export default function LinkQrModal({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    generateQrDataUrl(url).then(setSrc).catch(() => {});
  }, [url]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.qrCard} onClick={(e) => e.stopPropagation()}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="QR code" width={240} height={240} />
        ) : (
          <p>Generating…</p>
        )}
        {src && (
          <a href={src} download="qr.png" className={styles.qrDownload}>
            Download PNG
          </a>
        )}
        <p className={styles.qrUrl}>{url}</p>
      </div>
    </div>
  );
}
