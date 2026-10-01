import { useState } from "react";
import TaskCard from "./components/TaskCard.jsx";
import AddTaskForm from "./components/AddTaskForm.jsx";

// Initial tasks for the university dashboard
const initialTasks = [
  {
    id: "task-1",
    title: "Calculus Homework",
    subject: "Mathematics",
    status: "Doing",
    priority: "High",
    resetVersion: 0,
  },
  {
    id: "task-2",
    title: "React Practice",
    subject: "Web Development",
    status: "Todo",
    priority: "Medium",
    resetVersion: 0,
  },
  {
    id: "task-3",
    title: "Database Quiz",
    subject: "Databases",
    status: "Done",
    priority: "High",
    resetVersion: 0,
  },
  {
    id: "task-4",
    title: "English Presentation",
    subject: "English",
    status: "Todo",
    priority: "Low",
    resetVersion: 0,
  },
];

function App() {
  // Demonstration of re-rendering: logged on every render
  console.log("App rendered");

  // Parent state stores the task list.
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [reversed, setReversed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Statistics derived directly from parent state during render
  const totalCount = tasks.length;
  const todoCount = tasks.filter((task) => task.status === "Todo").length;
  const doingCount = tasks.filter((task) => task.status === "Doing").length;
  const doneCount = tasks.filter((task) => task.status === "Done").length;

  // Add task to parent state
  function addTask(newTask) {
    setTasks([...tasks, newTask]);
    setShowAddForm(false);
  }

  // Delete task from parent state
  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  // Change task status in parent state
  function changeStatus(id, newStatus) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  }

  // Changing resetVersion changes the React key.
  // React creates a new TaskCard, so its local state resets.
  function resetTaskState(id) {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, resetVersion: task.resetVersion + 1 }
          : task
      )
    );
  }

  // Toggle list visual ordering without mutating the original tasks array
  function toggleReverse() {
    setReversed(!reversed);
  }

  // Create a reversed copy of tasks if reordering is active
  const displayedTasks = reversed ? [...tasks].reverse() : tasks;

  // Check if at least one task is currently visible to show an empty message if needed
  const cleanSearch = search.trim().toLowerCase();
  const hasVisibleTasks = displayedTasks.some((task) => {
    const matchesFilter = filter === "All" || task.status === filter;
    const matchesSearch =
      cleanSearch === "" ||
      task.title.toLowerCase().includes(cleanSearch) ||
      task.subject.toLowerCase().includes(cleanSearch);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="app-container">
      {/* Header section */}
      <header className="app-header">
        <div className="brand-block">
          <span className="brand-tag">FOCUS</span>
          <h1 className="brand-title">Study Task Board</h1>
          <p className="brand-subtitle">Keep university work under control.</p>
        </div>

        {/* Top statistics derived from tasks state */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-label">TOTAL</span>
            <span className="stat-value">{totalCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">TODO</span>
            <span className="stat-value">{todoCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">DOING</span>
            <span className="stat-value">{doingCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">DONE</span>
            <span className="stat-value">{doneCount}</span>
          </div>
        </div>
      </header>

      {/* Control bar: search, filtering, reordering, adding tasks */}
      <section className="controls-section">
        <div className="search-wrap">
          <input
            type="text"
            className="search-input"
            placeholder="Search by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="controls-actions">
          {/* Status filter buttons */}
          <div className="filter-group" role="group" aria-label="Status filter">
            {["All", "Todo", "Doing", "Done"].map((status) => (
              <button
                key={status}
                type="button"
                className={`filter-btn ${filter === status ? "active" : ""}`}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Reverse order button */}
          <button
            type="button"
            className={`btn-reverse ${reversed ? "active" : ""}`}
            onClick={toggleReverse}
          >
            {reversed ? "Reversed (Z–A)" : "Reverse order"}
          </button>

          {/* Add task button */}
          <button
            type="button"
            className="btn-add-task"
            onClick={() => setShowAddForm(true)}
          >
            + Add task
          </button>
        </div>
      </section>

      {/* Conditional rendering of modal add task form */}
      {showAddForm && (
        <AddTaskForm
          onAddTask={addTask}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Conditional rendering for empty task list */}
      {tasks.length === 0 && (
        <div className="empty-state">
          <p className="empty-title">No tasks yet.</p>
          <p className="empty-desc">Click &ldquo;+ Add task&rdquo; above to create your first university task.</p>
        </div>
      )}

      {/* Conditional rendering when filters hide everything */}
      {tasks.length > 0 && !hasVisibleTasks && (
        <div className="empty-state">
          <p className="empty-title">No matching tasks found.</p>
          <p className="empty-desc">Try clearing your search query or selecting &ldquo;All&rdquo; filter.</p>
        </div>
      )}

      {/* Task cards grid */}
      <main className="tasks-grid">
        {displayedTasks.map((task) => {
          const matchesFilter = filter === "All" || task.status === filter;
          const matchesSearch =
            cleanSearch === "" ||
            task.title.toLowerCase().includes(cleanSearch) ||
            task.subject.toLowerCase().includes(cleanSearch);

          // We hide filtered cards instead of unmounting them,
          // so their local state stays preserved.
          const isHidden = !matchesFilter || !matchesSearch;

          // Stable ID helps React keep the correct component
          // when the list order changes.
          // Changing resetVersion creates a new key, forcing React
          // to recreate the card and reset its local state.
          return (
            <TaskCard
              key={`${task.id}-${task.resetVersion}`}
              task={task}
              hidden={isHidden}
              onDelete={deleteTask}
              onStatusChange={changeStatus}
              onReset={resetTaskState}
            />
          );
        })}
      </main>
    </div>
  );
}

export default App;
