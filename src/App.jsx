import { useState, useRef } from 'react'
import BlueprintGrid from './components/BlueprintGrid'
import ParkingLot from './components/ParkingLot'
import Toolbar from './components/Toolbar'
import './App.css'

const SWIMLANES = [
  { id: 'Touchpoints', label: 'Touchpoints', description: 'Channels or interfaces the customer interacts with' },
  { id: 'Customer Actions', label: 'Customer Actions', description: 'What the customer does at each step' },
  { id: 'Frontstage', label: 'Frontstage', description: 'Employee actions visible to the customer' },
  { id: 'Backstage', label: 'Backstage', description: 'Employee actions hidden from the customer' },
  { id: 'Support Processes', label: 'Support Processes', description: 'Internal systems, tools, or policies that enable the service' },
  { id: 'Pain Points', label: 'Pain Points', description: 'Friction, failures, or frustrations' },
]

const SWIMLANE_LABELS = SWIMLANES.map((s) => s.id)

function createEmptyBlueprint() {
  return {
    title: 'Untitled Blueprint',
    scenario: '',
    columns: Array.from({ length: 5 }, () => createColumn()),
    parkingLot: [],
  }
}

let columnIdCounter = 1
let itemIdCounter = 1
function createColumn() {
  const id = `col-${Date.now()}-${columnIdCounter++}`
  return {
    id,
    cells: SWIMLANE_LABELS.reduce((acc, lane) => {
      acc[lane] = [createItem()]
      return acc
    }, {}),
  }
}

function createItem() {
  return { id: `item-${Date.now()}-${itemIdCounter++}`, text: '', color: null }
}

export { createColumn, createItem, SWIMLANE_LABELS }

export default function App() {
  const [blueprint, setBlueprint] = useState(createEmptyBlueprint)
  const fileInputRef = useRef(null)

  const updateTitle = (title) => setBlueprint((b) => ({ ...b, title }))
  const updateScenario = (scenario) => setBlueprint((b) => ({ ...b, scenario }))

  const addColumn = () => {
    setBlueprint((b) => ({ ...b, columns: [...b.columns, createColumn()] }))
  }

  const updateCellItem = (colId, lane, itemId, value) => {
    setBlueprint((b) => ({
      ...b,
      columns: b.columns.map((col) =>
        col.id === colId
          ? {
              ...col,
              cells: {
                ...col.cells,
                [lane]: col.cells[lane].map((item) =>
                  item.id === itemId ? { ...item, ...value } : item
                ),
              },
            }
          : col
      ),
    }))
  }

  const addCellItem = (colId, lane) => {
    setBlueprint((b) => ({
      ...b,
      columns: b.columns.map((col) =>
        col.id === colId
          ? { ...col, cells: { ...col.cells, [lane]: [...col.cells[lane], createItem()] } }
          : col
      ),
    }))
  }

  const removeCellItem = (colId, lane, itemId) => {
    setBlueprint((b) => ({
      ...b,
      columns: b.columns.map((col) =>
        col.id === colId
          ? {
              ...col,
              cells: {
                ...col.cells,
                [lane]: col.cells[lane].length > 1
                  ? col.cells[lane].filter((item) => item.id !== itemId)
                  : col.cells[lane],
              },
            }
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
        swimlanes={SWIMLANES}
        onAddColumn={addColumn}
        onUpdateCellItem={updateCellItem}
        onAddCellItem={addCellItem}
        onRemoveCellItem={removeCellItem}
        onDeleteColumn={deleteColumn}
        onReorderColumns={reorderColumns}
      />

      <ParkingLot items={blueprint.parkingLot} onChange={updateParkingLot} />
    </div>
  )
}
