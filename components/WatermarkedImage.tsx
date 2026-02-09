"use client"
import React, { useEffect, useRef } from 'react'

interface Props {
    src: string
    watermarkText: string
    className?: string
}

export default function WatermarkedImage({ src, watermarkText, className }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height

            // Draw the original image
            ctx.drawImage(img, 0, 0)

            // Add watermark
            ctx.font = `${Math.max(20, img.width / 30)}px Arial`
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
            ctx.textAlign = 'center'

            // Diagonal watermark pattern
            ctx.save()
            ctx.translate(canvas.width / 2, canvas.height / 2)
            ctx.rotate(-Math.PI / 4)

            const spacing = img.width / 3
            for (let x = -canvas.width; x < canvas.width; x += spacing) {
                for (let y = -canvas.height; y < canvas.height; y += spacing) {
                    ctx.fillText(watermarkText, x, y)
                }
            }
            ctx.restore()

            // Bottom right watermark
            ctx.font = `${Math.max(14, img.width / 50)}px Arial`
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
            ctx.textAlign = 'right'
            ctx.fillText(`NIGHTSTUDIO | @${watermarkText}`, canvas.width - 20, canvas.height - 20)
        }
        img.src = src
    }, [src, watermarkText])

    return (
        <canvas
            ref={canvasRef}
            className={`w-full h-full object-contain ${className}`}
            style={{ display: 'block' }}
        />
    )
}
