import { useState } from "react";

// TaskCard demonstrates child local state and component identity.
// It receives task data and action callbacks through props.
function TaskCard({ task, hidden, onDelete, onStatusChange, onReset }) {
  // Demonstration of re-rendering: logged on every render
  console.log("TaskCard rendered:", task.title);

  // Child local state: lives exclusively inside this TaskCard instance.
  // Each rendered card has its own independent focusLevel.
  const [focusLevel, setFocusLevel] = useState(0);

  function handleDecreaseFocus() {
    if (focusLevel > 0) {
      setFocusLevel(focusLevel - 1);
    }
  }

  function handleIncreaseFocus() {
    if (focusLevel < 5) {
      setFocusLevel(focusLevel + 1);
    }
  }

  // We hide filtered cards instead of unmounting them,
  // so their local state stays preserved.
  return (
    <article className="task-card" hidden={hidden}>
      <header className="task-card-header">
        <span className="task-subject">{task.subject}</span>
        <span
          className={`priority-badge priority-${task.priority.toLowerCase()}`}
        >
          {task.priority}
        </span>
      </header>

      <h3 className="task-title">{task.title}</h3>

      <div className="task-status-row">
        <label htmlFor={`status-${task.id}`} className="status-label">
          Status
        </label>
        <select
          id={`status-${task.id}`}
          className="status-select"
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
        >
          <option value="Todo">Todo</option>
          <option value="Doing">Doing</option>
          <option value="Done">Done</option>
        </select>
      </div>

      <div className="focus-section">
        <span className="focus-label">Focus level</span>
        <div className="focus-controls">
          <button
            type="button"
            className="focus-btn"
            onClick={handleDecreaseFocus}
            disabled={focusLevel === 0}
            aria-label="Decrease focus"
          >
            −
          </button>
          <span className="focus-value">{focusLevel} / 5</span>
          <button
            type="button"
            className="focus-btn"
            onClick={handleIncreaseFocus}
            disabled={focusLevel === 5}
            aria-label="Increase focus"
          >
            +
          </button>
        </div>
      </div>

      <footer className="task-card-actions">
        <button
          type="button"
          className="btn-reset"
          onClick={() => onReset(task.id)}
        >
          Reset local state
        </button>
        <button
          type="button"
          className="btn-delete"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </footer>
    </article>
  );
}

export default TaskCard;
