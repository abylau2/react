# Homework — JavaScript Runtime and Async

A vanilla JavaScript project demonstrating **Closures**, the **Call Stack**, **Promises**, **async/await**, and the **Event Loop** (Microtasks vs. Macrotasks).

---

## 1. How the closure keeps the task counter private

In `createTask(name, onUpdate)`, the counter is declared as a local variable:

```javascript
function createTask(name, onUpdate) {
  let count = 0; // Private variable in function lexical scope

  return {
    getName: () => name,
    getCount: () => count,
    reset: () => { count = 0; },
    run: () => {
      count++;
      // ...
    }
  };
}
```

- When `createTask` finishes executing, its execution context is popped off the Call Stack, but its Lexical Environment remains in memory because the returned methods (`run`, `getCount`, `reset`) maintain a reference to it via a **closure**.
- The variable `count` is not assigned as a property on the returned object (i.e. `task.count` evaluates to `undefined`).
- Outside code can only inspect or modify `count` through the explicitly exposed methods (`task.getCount()`, `task.reset()`, `task.run()`), making direct external mutation impossible. Each task instance creates its own distinct lexical scope with an independent counter.

---

## 2. How the Call Stack works in the application

The Call Stack is a LIFO (Last In, First Out) data structure that tracks the currently executing function frames in the single JavaScript thread.

### Example Walkthrough:
When a user clicks "Run" on an individual task:

1. **Push:** The browser invokes the `click` event listener on `taskListEl`. The frame `anonymous event handler` is pushed onto the Call Stack.
2. **Push:** The event handler calls `task.run()`. A new frame for `run()` is pushed onto the stack.
3. **Execution:** Inside `run()`:
   - `count++` executes synchronously.
   - `status = 'loading'` executes.
   - `notify()` is called, pushing `notify` &rarr; `renderTasks` onto the stack, re-rendering DOM elements, then popping both off once complete.
   - `new Promise(...)` constructor runs synchronously:
     - `setTimeout(..., delay)` is called. The timer registration is handed off to the browser's Web API environment.
     - `setTimeout` pops off.
   - `run()` returns the pending Promise and its frame pops off the stack.
4. **Pop:** The event listener function completes and pops off the Call Stack.
5. **Idle:** The Call Stack is now completely empty. The JavaScript thread is unblocked and free to respond to other user interactions or events while the browser timer counts down in the background.

---

## 3. How JavaScript continues while `setTimeout` is waiting

JavaScript is single-threaded; it possesses only one Call Stack and executes one operation at a time. It avoids freezing during timers via **Browser Web APIs**:

1. When `setTimeout(callback, delay)` is executed, the JavaScript engine does **not** sit in an active sleep loop. Instead, it registers the callback and delay with the browser's timer thread (part of the Web API environment outside the V8/JS engine).
2. The `setTimeout` call finishes immediately and is removed from the Call Stack.
3. Synchronous execution continues uninterrupted on the main thread.
4. When the specified `delay` has elapsed, the browser's timer thread places the callback function into the **Task Queue (Macrotask Queue)**.
5. The callback only enters the Call Stack when the Call Stack is completely empty and all pending microtasks have been drained by the Event Loop.

---

## 4. Event Loop Demo: Predicted vs. Actual Output

### Code Example:
```javascript
console.log('1. [Sync] Script start');

setTimeout(() => {
  console.log('2. [Task / Macrotask] setTimeout 1 (0ms)');
}, 0);

setTimeout(() => {
  console.log('3. [Task / Macrotask] setTimeout 2 (50ms)');
}, 50);

Promise.resolve().then(() => {
  console.log('4. [Microtask] Promise 1 resolved');
}).then(() => {
  console.log('5. [Microtask] Promise 2 chained');
});

async function asyncDemo() {
  console.log('6. [Sync inside async] asyncDemo before await');
  await null;
  console.log('7. [Microtask] asyncDemo after await');
}
asyncDemo();

console.log('8. [Sync] Script end');
```

### Predicted Console Output:
```text
1. [Sync] Script start
6. [Sync inside async] asyncDemo before await
8. [Sync] Script end
4. [Microtask] Promise 1 resolved
7. [Microtask] asyncDemo after await
5. [Microtask] Promise 2 chained
2. [Task / Macrotask] setTimeout 1 (0ms)
3. [Task / Macrotask] setTimeout 2 (50ms)
```

### Actual Console Output:
```text
1. [Sync] Script start
6. [Sync inside async] asyncDemo before await
8. [Sync] Script end
4. [Microtask] Promise 1 resolved
7. [Microtask] asyncDemo after await
5. [Microtask] Promise 2 chained
2. [Task / Macrotask] setTimeout 1 (0ms)
3. [Task / Macrotask] setTimeout 2 (50ms)
```

### Explanation (`Call Stack → Microtask Queue → Task Queue → Event Loop`):

1. **Call Stack (Synchronous phase):**
   - Logs `1`.
   - `setTimeout(..., 0)` registers Timer 1 with Web API.
   - `setTimeout(..., 50)` registers Timer 2 with Web API.
   - `Promise.resolve().then(...)` queues its callback (`4`) into the **Microtask Queue**.
   - `asyncDemo()` is called:
     - Logs `6` synchronously.
     - Encounters `await null`. The expression is evaluated, and the remainder of the async function (`7`) is queued into the **Microtask Queue**.
   - Logs `8`.
   - Call stack is now empty.
2. **Microtask Queue (Drain phase):**
   - The Event Loop checks the Microtask Queue before any macrotask.
   - Dequeues `4`. Its execution returns a new promise whose `.then()` handler (`5`) is immediately queued at the end of the Microtask Queue.
   - Dequeues `7` (`asyncDemo` continuation) and logs it.
   - Dequeues `5` (chained promise) and logs it.
   - Microtask Queue is now empty.
3. **Task Queue (Macrotask phase):**
   - The Event Loop takes the oldest ready task from the Task Queue: Timer 1 (0ms callback).
   - Pushes it to the Call Stack; logs `2`. Stack empties.
   - After ~50ms, Timer 2 expires and enters the Task Queue.
   - The Event Loop dequeues it; logs `3`.

---

## 5. Difference between Tasks (Macrotasks) and Microtasks

| Feature | Microtasks | Tasks (Macrotasks) |
|---|---|---|
| **Sources** | `Promise.then / catch / finally`, `queueMicrotask`, `await` resume, `MutationObserver` | `setTimeout`, `setInterval`, DOM event callbacks, UI rendering, I/O |
| **Queue** | Microtask Queue | Task Queue (Macrotask Queue) |
| **Execution Priority** | **High / Immediate**. The entire queue is drained until empty after every stack execution. | **Standard**. Executed one at a time per Event Loop iteration. |
| **Starvation Risk** | High. Infinite recursive microtasks freeze the thread and block rendering. | Low. Browser renders between tasks. |

---

## 6. How multiple Promises and errors are handled

In this application, some tasks are configured to randomly fail (~30% probability) to simulate real network requests.

### Why `Promise.allSettled` is used over `Promise.all`:
- **`Promise.all` (Fail-Fast):** If any single promise rejects, `Promise.all` immediately rejects with that error, ignoring whether the remaining tasks succeeded or failed.
- **`Promise.allSettled` (Resilient):** Waits until every single promise has either fulfilled or rejected. It returns an array of outcome objects:
  - `{ status: 'fulfilled', value: ... }`
  - `{ status: 'rejected', reason: ... }`

In `runAllBtn` and the comparison runner, we use:
```javascript
await Promise.allSettled(tasks.map(task => task.run()));
```
This guarantees the "All tasks finished" message is displayed **only when every task has settled**, regardless of how many failed or succeeded.

---

## 7. Difference between Sequential and Concurrent Execution

### Sequential Execution:
```javascript
await task1.run();
await task2.run();
await task3.run();
```
- Each task starts only after the previous task's Promise has settled.
- If tasks take $t_1, t_2, t_3$, the total execution time is:
  $$\text{Total Time} \approx t_1 + t_2 + t_3$$

### Concurrent Execution:
```javascript
await Promise.allSettled([task1.run(), task2.run(), task3.run()]);
```
- All three `run()` calls are invoked in the same synchronous frame.
- Their underlying `setTimeout` browser timers run concurrently in the Web API background.
- The total execution time is bounded by the slowest task:
  $$\text{Total Time} \approx \max(t_1, t_2, t_3)$$

### Measured Example:
- **Sequential:** $1250\text{ ms} + 1800\text{ ms} + 950\text{ ms} \approx 4000\text{ ms}$
- **Concurrent:** $\max(1250, 1800, 950) \approx 1800\text{ ms}$ (~2.2x faster)

---

## Project Structure
```text
async-js-homework/
├── index.html     # Semantic HTML UI layout
├── style.css      # Clean modern CSS styling (responsive)
├── script.js      # Pure vanilla JS: closures, tasks, comparison, event loop demo
└── README.md      # Theoretical & architectural explanations
```
