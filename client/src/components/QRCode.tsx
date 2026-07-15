import { useEffect, useRef } from 'react'
import QRCodeLib from 'qrcode'

interface Props {
  value: string
  size?: number
}

export default function QRCode({ value, size = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCodeLib.toCanvas(canvasRef.current, value, {
      width: size,
      color: { dark: '#e0e7ff', light: '#111827' },
    }).catch(() => {})
  }, [value, size])

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-xl" />
}
