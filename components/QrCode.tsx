import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import useDarkMode from "../hooks/useDarkMode";

export default function QrCode({
  data,
  className,
}: {
  data: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const isDark = useDarkMode();

  useEffect(() => {
    if (ref.current === null) {
      return;
    }

    QRCode.toCanvas(ref.current, data, {
      width: 240,
      color: isDark ? { dark: "#fff", light: "#111827" } : undefined,
    });
  }, [data, isDark]);

  return <canvas className={className} ref={ref} />;
}
