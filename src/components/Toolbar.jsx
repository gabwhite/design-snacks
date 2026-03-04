import './Toolbar.css'

export default function Toolbar({
  title,
  scenario,
  onTitleChange,
  onScenarioChange,
  onExport,
  onImport,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <input
          className="toolbar-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Blueprint title..."
        />
        <input
          className="toolbar-scenario"
          value={scenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          placeholder="Scenario: e.g. 'New customer onboarding'"
        />
      </div>
      <div className="toolbar-actions">
        <button className="btn btn-secondary" onClick={onImport}>
          Import JSON
        </button>
        <button className="btn btn-primary" onClick={onExport}>
          Export JSON
        </button>
      </div>
    </div>
  )
}
