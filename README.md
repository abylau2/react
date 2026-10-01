# FOCUS — Study Task Board

A university React homework project demonstrating core React concepts: **Rendering**, **`useState`**, **Parent vs. Child local state**, **Props**, **Reconciliation**, **Component Identity**, **Stable Keys**, and **Intentional State Reset using Keys**.

---

## 1. What the Project Is

**FOCUS — Study Task Board** is a single-page application built for university students to track their coursework tasks (homework, practice, quizzes, presentations).

Each task card shows:
- **Subject** and **Title**
- **Priority** (`High`, `Medium`, `Low`)
- **Status** (`Todo`, `Doing`, `Done`)
- **Focus Level** (local counter from `0` to `5`)
- Actions to **Reset local state** and **Delete**

The dashboard provides:
- Live statistics derived directly from state (Total, Todo, Doing, Done)
- Search by title or subject
- Filtering by status (`All`, `Todo`, `Doing`, `Done`)
- Visual order reversal
- Modal form to add new tasks

---

## 2. How to Run the Project

This project uses **Vite** and **React** with zero external state libraries.

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build
npm run preview
```

---

## 3. Component Structure

The architecture is kept minimal and clean:

```text
src/
├── main.jsx                 # Entry point that mounts React root
├── App.jsx                  # Main dashboard (holds parent state)
├── App.css                  # Clean, modern university styling
└── components/
    ├── TaskCard.jsx         # Child component with its own local state (focusLevel)
    └── AddTaskForm.jsx      # Controlled modal form to create a new task
```

---

## 4. Which State is Parent State

In `App.jsx`, the parent manages state that affects the whole board:

- **`tasks`**: The array of task objects (`id`, `title`, `subject`, `status`, `priority`, `resetVersion`).
- **`filter`**: Current status filter (`"All"`, `"Todo"`, `"Doing"`, `"Done"`).
- **`search`**: Current text search query.
- **`reversed`**: Boolean indicating whether visual card ordering is reversed.
- **`showAddForm`**: Boolean toggling the "+ Add task" modal dialog.

### Why this belongs to Parent State:
When a task is added, deleted, or its status changes, or when the user filters or searches, the entire board layout and the header statistics (Total, Todo, Doing, Done) need to update.

---

## 5. Which State is Child Local State

Inside `TaskCard.jsx`:

```javascript
const [focusLevel, setFocusLevel] = useState(0);
```

- Each rendered `TaskCard` instance manages its own independent `focusLevel` (values from 0 to 5).
- `focusLevel` is **not** stored in the parent's `tasks` array.
- Changing `focusLevel` in "Calculus Homework" only re-renders that card and does **not** affect "React Practice" or any other task.

Inside `AddTaskForm.jsx`:
- `title`, `subject`, and `priority` are held in local state while the student fills out the form.

---

## 6. How Filtering Preserves Local State

### The Problem:
If we filter an array before calling `.map()`:

```javascript
// BAD PRACTICE for this scenario:
tasks.filter(task => task.status === filter).map(...)
```

When a task does not match the filter, React **unmounts** the component from the DOM tree. When a component unmounts, React deletes its internal state memory. When the user returns to `"All"`, a new component is mounted with default state (`focusLevel = 0`), losing the student's progress!

### The Solution:
We render **all** tasks with `.map()` and pass a `hidden` boolean prop:

```javascript
const matchesFilter = filter === "All" || task.status === filter;
const matchesSearch =
  cleanSearch === "" ||
  task.title.toLowerCase().includes(cleanSearch) ||
  task.subject.toLowerCase().includes(cleanSearch);

const isHidden = !matchesFilter || !matchesSearch;

<TaskCard
  key={`${task.id}-${task.resetVersion}`}
  task={task}
  hidden={isHidden}
  ...
/>
```

In `TaskCard.jsx`:

```jsx
<article className="task-card" hidden={hidden}>
```

And in `App.css`:

```css
.task-card[hidden] {
  display: none !important;
}
```

### Result:
1. React keeps the `TaskCard` component **mounted** in the React tree.
2. The component's local `focusLevel` state stays intact in memory.
3. The user does not see cards that don't match the search or filter.
4. When the filter or search is cleared, the card becomes visible with its exact previous `focusLevel`.

---

## 7. Why Stable Keys are Important

When rendering lists in React, we must provide a `key` prop:

```jsx
key={`${task.id}-${task.resetVersion}`}
```

### Why NEVER `key={index}`:
If we used array indexes (`key={0}`, `key={1}`), and then clicked **Reverse order**:
- The first card in the new array would still have `key={0}`.
- React would think it is the same component in the same position with updated props!
- React would transfer the previous card's local state to the new task (e.g. Calculus focus would stick to English)!

### Why Stable Keys (`task.id`):
- `task.id` is permanent and unique (e.g., `"task-1"`).
- When the order reverses, React matches each component by its permanent key.
- React simply repositions the existing component in the DOM.
- **Component identity is preserved**, and each task keeps its own `focusLevel`.

---

## 8. Why Changing `resetVersion` Resets Local State

The "Reset local state" button demonstrates **intentional state reset using keys**.

### How It Works:
1. `focusLevel` is private child state inside `TaskCard`. The parent cannot call `setFocusLevel(0)` directly.
2. When the user clicks "Reset local state", `TaskCard` calls `onReset(task.id)`.
3. In `App.jsx`, `resetTaskState` increments the task's `resetVersion`:
   ```javascript
   function resetTaskState(id) {
     setTasks(
       tasks.map((task) =>
         task.id === id
           ? { ...task, resetVersion: task.resetVersion + 1 }
           : task
       )
     );
   }
   ```
4. The key changes:
   - Before: `key="task-1-0"`
   - After: `key="task-1-1"`
5. During reconciliation, React sees a **different key** at that position.
6. React treats the old `task-1-0` component as destroyed (unmounts it) and mounts a **brand-new** `TaskCard` instance.
7. The new component runs `useState(0)` fresh from its initial value.
8. Other tasks in the list whose keys did not change (e.g. `task-2-0`) are **not** reset and retain their state!

---

## 9. What Reconciliation Means in This Project

**Reconciliation** is React's algorithm for comparing the previous Virtual DOM tree with the new Virtual DOM tree to determine the minimum number of changes needed in the real browser DOM.

In this project, reconciliation is demonstrated through:
1. **List Reordering:** When clicking "Reverse order", React uses the stable keys (`task-1-0`, `task-2-0`) to recognize that cards merely moved positions. It reorders DOM nodes instead of recreating them, preserving local state.
2. **Key Invalidation (Reset):** When `resetVersion` changes, React's reconciler recognizes that the key no longer matches any existing node in that slot. It tears down the old component tree and constructs a fresh one with initial state.
3. **Derived Statistics:** When `tasks` state changes, React re-executes `App()`, compares the output, and updates only the specific text nodes displaying the counts (e.g., `TOTAL: 4`).
4. **Console Logs:** `console.log("App rendered")` and `console.log("TaskCard rendered:", task.title)` allow you to open Developer Tools (`F12`) and observe exactly when and why components re-render during state updates.

---

## Note on Previous Assignments

The earlier vanilla JavaScript assignment from Task 1 is preserved in the [`task1/`](./task1/) directory.
