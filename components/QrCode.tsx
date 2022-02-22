import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QrCode({
  data,
  className,
}: {
  data: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current === null) {
      return;
    }

    QRCode.toCanvas(ref.current, data, { width: 240 });
  }, [data]);

  return <canvas className={className} ref={ref} />;
}
