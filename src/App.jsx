import { useState, useRef } from 'react'
import BlueprintGrid from './components/BlueprintGrid'
import ParkingLot from './components/ParkingLot'
import Toolbar from './components/Toolbar'
import './App.css'

const SWIMLANE_LABELS = [
  'Touchpoints',
  'Customer Actions',
  'Frontstage',
  'Backstage',
  'Support Processes',
  'Pain Points',
]

function createEmptyBlueprint() {
  return {
    title: 'Untitled Blueprint',
    scenario: '',
    columns: [createColumn()],
    parkingLot: [],
  }
}

let columnIdCounter = 1
function createColumn() {
  const id = `col-${Date.now()}-${columnIdCounter++}`
  return {
    id,
    cells: SWIMLANE_LABELS.reduce((acc, lane) => {
      acc[lane] = { text: '', color: null }
      return acc
    }, {}),
  }
}

export { createColumn, SWIMLANE_LABELS }

export default function App() {
  const [blueprint, setBlueprint] = useState(createEmptyBlueprint)
  const fileInputRef = useRef(null)

  const updateTitle = (title) => setBlueprint((b) => ({ ...b, title }))
  const updateScenario = (scenario) => setBlueprint((b) => ({ ...b, scenario }))

  const addColumn = () => {
    setBlueprint((b) => ({ ...b, columns: [...b.columns, createColumn()] }))
  }

  const updateCell = (colId, lane, value) => {
    setBlueprint((b) => ({
      ...b,
      columns: b.columns.map((col) =>
        col.id === colId
          ? { ...col, cells: { ...col.cells, [lane]: { ...col.cells[lane], ...value } } }
          : col
      ),
    }))
  }

  const deleteColumn = (colId) => {
    setBlueprint((b) => ({
      ...b,
      columns: b.columns.filter((c) => c.id !== colId),
    }))
  }

  const reorderColumns = (newColumns) => {
    setBlueprint((b) => ({ ...b, columns: newColumns }))
  }

  const updateParkingLot = (parkingLot) => {
    setBlueprint((b) => ({ ...b, parkingLot }))
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${blueprint.title.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJSON = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        setBlueprint(data)
      } catch {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="app">
      <Toolbar
        title={blueprint.title}
        scenario={blueprint.scenario}
        onTitleChange={updateTitle}
        onScenarioChange={updateScenario}
        onExport={exportJSON}
        onImport={() => fileInputRef.current?.click()}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importJSON}
        style={{ display: 'none' }}
      />

      <BlueprintGrid
        columns={blueprint.columns}
        swimlanes={SWIMLANE_LABELS}
        onAddColumn={addColumn}
        onUpdateCell={updateCell}
        onDeleteColumn={deleteColumn}
        onReorderColumns={reorderColumns}
      />

      <ParkingLot items={blueprint.parkingLot} onChange={updateParkingLot} />
    </div>
  )
}
