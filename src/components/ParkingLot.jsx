import { useState } from 'react'
import './ParkingLot.css'

export default function ParkingLot({ items, onChange }) {
  const [input, setInput] = useState('')

  const addItem = () => {
    const text = input.trim()
    if (!text) return
    onChange([...items, { id: `pl-${Date.now()}`, text }])
    setInput('')
  }

  const removeItem = (id) => {
    onChange(items.filter((item) => item.id !== id))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem()
    }
  }

  return (
    <div className="parking-lot">
      <h3 className="parking-lot-title">Parking Lot</h3>
      <p className="parking-lot-subtitle">Ideas and assumptions parked for now</p>

      <div className="parking-lot-items">
        {items.map((item) => (
          <div key={item.id} className="parking-lot-item">
            <span>{item.text}</span>
            <button
              className="remove-item-btn"
              onClick={() => removeItem(item.id)}
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="parking-lot-input-row">
        <input
          className="parking-lot-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a note or assumption..."
        />
        <button className="btn btn-secondary" onClick={addItem}>
          Add
        </button>
      </div>
    </div>
  )
}
