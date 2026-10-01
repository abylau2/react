import { useState } from "react";

// AddTaskForm allows the user to add a new task to the parent task list.
// It manages its own form inputs as local state until submitted.
function AddTaskForm({ onAddTask, onCancel }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("Medium");

  function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim() || !subject.trim()) {
      return;
    }

    // Create a new task object with a stable unique ID
    const newTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      subject: subject.trim(),
      status: "Todo", // Default status per assignment
      priority: priority,
      resetVersion: 0,
    };

    onAddTask(newTask);
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form
        className="add-task-form"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="form-header">
          <h2 className="form-title">Add New Study Task</h2>
          <button
            type="button"
            className="form-close-btn"
            onClick={onCancel}
            aria-label="Close form"
          >
            ✕
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="task-title" className="form-label">
            Title
          </label>
          <input
            id="task-title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Calculus Homework"
            autoFocus
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-subject" className="form-label">
            Subject
          </label>
          <input
            id="task-subject"
            type="text"
            className="form-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Mathematics"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-priority" className="form-label">
            Priority
          </label>
          <select
            id="task-priority"
            className="form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTaskForm;
