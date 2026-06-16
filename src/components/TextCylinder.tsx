import { useEffect, useRef } from 'react'

const WORDS = ['KUNST', 'KOSMOS', 'TRADITION', 'ZEIT', 'ELEMENTE', 'HARMONIE', 'WEISHEIT', 'RAUM', 'BEWUSSTSEIN']

function StripContent() {
  return (
    <>
      {WORDS.map((word, i) => (
        <span key={i}>{word}</span>
      ))}
    </>
  )
}

export default function TextCylinder() {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    let isDragging = false
    let startX = 0
    let currentRotation = 0

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      startX = e.clientX
      wrapper.style.cursor = 'grabbing'
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const delta = e.clientX - startX
      currentRotation += delta * 0.5
      wrapper.style.transform = `rotateY(${currentRotation}deg)`
      startX = e.clientX
    }

    const onMouseUp = () => {
      isDragging = false
      wrapper.style.cursor = 'grab'
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <div className="cylinder-scene">
      <div className="cylinder-wrapper" ref={wrapperRef}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="cylinder-strip">
            <StripContent />
          </div>
        ))}
      </div>
    </div>
  )
}
