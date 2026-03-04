import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ColorPicker from './ColorPicker'
import './BlueprintGrid.css'

const LINE_OF_INTERACTION = 2 // after Customer Actions
const LINE_OF_VISIBILITY = 3  // after Frontstage

function SortableColumn({ column, swimlanes, onUpdateCell, onDeleteColumn, columnIndex }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="grid-column">
      <div className="column-header">
        <span className="column-number">Step {columnIndex + 1}</span>
        <button
          className="drag-handle"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          ⠿
        </button>
        <button
          className="delete-column-btn"
          onClick={() => onDeleteColumn(column.id)}
          title="Delete step"
        >
          ×
        </button>
      </div>
      {swimlanes.map((lane, laneIdx) => (
        <CellEditor
          key={lane}
          lane={lane}
          cell={column.cells[lane]}
          onChange={(val) => onUpdateCell(column.id, lane, val)}
          isPainPoint={lane === 'Pain Points'}
          showInteractionLine={laneIdx === LINE_OF_INTERACTION}
          showVisibilityLine={laneIdx === LINE_OF_VISIBILITY}
        />
      ))}
    </div>
  )
}

function CellEditor({ lane, cell, onChange, isPainPoint, showInteractionLine, showVisibilityLine }) {
  const [showColorPicker, setShowColorPicker] = useState(false)

  return (
    <>
      {showInteractionLine && (
        <div className="divider-line interaction-line">
          <span>Line of Interaction</span>
        </div>
      )}
      {showVisibilityLine && (
        <div className="divider-line visibility-line">
          <span>Line of Visibility</span>
        </div>
      )}
      <div
        className={`grid-cell ${isPainPoint ? 'pain-point-cell' : ''}`}
        style={cell.color ? { backgroundColor: cell.color } : undefined}
      >
        <textarea
          className="cell-input"
          value={cell.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder={isPainPoint ? 'Friction, issue...' : `${lane}...`}
          rows={2}
        />
        <button
          className="color-btn"
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Set colour"
        >
          <span
            className="color-dot"
            style={{ background: cell.color || '#ddd' }}
          />
        </button>
        {showColorPicker && (
          <ColorPicker
            current={cell.color}
            onSelect={(color) => {
              onChange({ color })
              setShowColorPicker(false)
            }}
            onClose={() => setShowColorPicker(false)}
          />
        )}
      </div>
    </>
  )
}

export default function BlueprintGrid({
  columns,
  swimlanes,
  onAddColumn,
  onUpdateCell,
  onDeleteColumn,
  onReorderColumns,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = columns.findIndex((c) => c.id === active.id)
      const newIndex = columns.findIndex((c) => c.id === over.id)
      onReorderColumns(arrayMove(columns, oldIndex, newIndex))
    }
  }

  return (
    <div className="blueprint-grid-wrapper">
      <div className="blueprint-grid">
        {/* Swimlane labels column */}
        <div className="swimlane-labels">
          <div className="label-header">&nbsp;</div>
          {swimlanes.map((lane, idx) => (
            <div key={lane}>
              {idx === LINE_OF_INTERACTION && (
                <div className="divider-line interaction-line">
                  <span>Line of Interaction</span>
                </div>
              )}
              {idx === LINE_OF_VISIBILITY && (
                <div className="divider-line visibility-line">
                  <span>Line of Visibility</span>
                </div>
              )}
              <div
                className={`swimlane-label ${lane === 'Pain Points' ? 'pain-point-label' : ''}`}
              >
                {lane}
              </div>
            </div>
          ))}
        </div>

        {/* Sortable columns */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((col, idx) => (
              <SortableColumn
                key={col.id}
                column={col}
                swimlanes={swimlanes}
                onUpdateCell={onUpdateCell}
                onDeleteColumn={onDeleteColumn}
                columnIndex={idx}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Add column button */}
        <div className="add-column">
          <button className="add-column-btn" onClick={onAddColumn} title="Add step">
            +
          </button>
        </div>
      </div>
    </div>
  )
}
