import { useState, Fragment } from 'react'
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

function SortableColumn({ column, swimlanes, onUpdateCellItem, onAddCellItem, onRemoveCellItem, onDeleteColumn, columnIndex }) {
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
        <Fragment key={lane}>
          {laneIdx === LINE_OF_INTERACTION && (
            <div className="divider-line" />
          )}
          {laneIdx === LINE_OF_VISIBILITY && (
            <div className="divider-line" />
          )}
          <CellGroup
            lane={lane}
            items={column.cells[lane]}
            onUpdateItem={(itemId, val) => onUpdateCellItem(column.id, lane, itemId, val)}
            onAddItem={() => onAddCellItem(column.id, lane)}
            onRemoveItem={(itemId) => onRemoveCellItem(column.id, lane, itemId)}
            isPainPoint={lane === 'Pain Points'}
          />
        </Fragment>
      ))}
    </div>
  )
}

function CellGroup({ lane, items, onUpdateItem, onAddItem, onRemoveItem, isPainPoint }) {
  return (
    <div className={`cell-group ${isPainPoint ? 'pain-point-group' : ''}`}>
      {items.map((item) => (
        <CellItem
          key={item.id}
          item={item}
          lane={lane}
          isPainPoint={isPainPoint}
          canRemove={items.length > 1}
          onChange={(val) => onUpdateItem(item.id, val)}
          onRemove={() => onRemoveItem(item.id)}
        />
      ))}
      <button className="add-item-btn" onClick={onAddItem} title={`Add ${lane.toLowerCase()}`}>
        +
      </button>
    </div>
  )
}

function CellItem({ item, lane, isPainPoint, canRemove, onChange, onRemove }) {
  const [showColorPicker, setShowColorPicker] = useState(false)

  return (
    <div
      className={`grid-cell ${isPainPoint ? 'pain-point-cell' : ''}`}
      style={item.color ? { backgroundColor: item.color } : undefined}
    >
      <textarea
        className="cell-input"
        value={item.text}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder={isPainPoint ? 'Friction, issue...' : `${lane}...`}
        rows={2}
      />
      <div className="cell-actions">
        {canRemove && (
          <button
            className="remove-item-btn"
            onClick={onRemove}
            title="Remove item"
          >
            ×
          </button>
        )}
        <button
          className="color-btn"
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Set colour"
        >
          <span
            className="color-dot"
            style={{ background: item.color || '#ddd' }}
          />
        </button>
      </div>
      {showColorPicker && (
        <ColorPicker
          current={item.color}
          onSelect={(color) => {
            onChange({ color })
            setShowColorPicker(false)
          }}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </div>
  )
}

export default function BlueprintGrid({
  columns,
  swimlanes,
  onAddColumn,
  onUpdateCellItem,
  onAddCellItem,
  onRemoveCellItem,
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

  const gridStyle = {
    gridTemplateColumns: `160px repeat(${columns.length}, 200px) auto`,
  }

  return (
    <div className="blueprint-grid-wrapper">
      <div className="blueprint-grid" style={gridStyle}>
        {/* Swimlane labels column */}
        <div className="swimlane-labels">
          <div className="label-header">&nbsp;</div>
          {swimlanes.map((lane, idx) => (
            <Fragment key={lane}>
              {idx === LINE_OF_INTERACTION && (
                <div className="divider-label">Line of Interaction</div>
              )}
              {idx === LINE_OF_VISIBILITY && (
                <div className="divider-label">Line of Visibility</div>
              )}
              <div
                className={`swimlane-label ${lane === 'Pain Points' ? 'pain-point-label' : ''}`}
              >
                {lane}
              </div>
            </Fragment>
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
                onUpdateCellItem={onUpdateCellItem}
                onAddCellItem={onAddCellItem}
                onRemoveCellItem={onRemoveCellItem}
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
