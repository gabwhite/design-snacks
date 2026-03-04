import { useEffect, useRef } from 'react'
import './ColorPicker.css'

const PALETTE = [
  '#F4C6C6', // soft pink
  '#D9C6F4', // soft lavender
  '#FFFFFF', // white
  '#F4D9C6', // soft peach
  '#F4ECC6', // soft yellow
  '#C6F4C6', // soft green
  '#C6F4E0', // mint
  '#C6E0D4', // teal-ish
  '#C6D9F4', // soft blue
  '#D4C6F4', // soft purple
  null,       // clear / no colour
]

export default function ColorPicker({ current, onSelect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div className="color-picker" ref={ref}>
      {PALETTE.map((color, i) => (
        <button
          key={i}
          className={`color-swatch ${color === current ? 'active' : ''} ${!color ? 'clear-swatch' : ''}`}
          style={color ? { background: color } : undefined}
          onClick={() => onSelect(color)}
          title={color || 'Clear'}
        >
          {!color && '×'}
        </button>
      ))}
    </div>
  )
}
