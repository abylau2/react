/**
 * Homework: JavaScript Runtime & Async
 * Pure vanilla JavaScript demonstrating Closures, Promises, async/await, and the Event Loop.
 */

// ----------------------------------------------------
// 1. Task Factory using Closure
// ----------------------------------------------------
function createTask(name, onUpdate) {
  // Private variables kept inside the closure scope
  let count = 0;
  let status = 'idle'; // 'idle' | 'loading' | 'completed' | 'failed'
  let loadingTime = 0;

  function notify() {
    if (typeof onUpdate === 'function') {
      onUpdate();
    }
  }

  return {
    getName: () => name,
    getCount: () => count,
    getStatus: () => status,
    getLoadingTime: () => loadingTime,

    reset: () => {
      count = 0;
      status = 'idle';
      loadingTime = 0;
      notify();
    },

    run: () => {
      count++;
      status = 'loading';
      notify();

      const startTime = performance.now();
      // Random delay between 500ms and 2000ms
      const delay = Math.floor(Math.random() * 1500) + 500;
      // ~30% probability of failure to simulate real-world errors
      const shouldFail = Math.random() < 0.3;

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          loadingTime = Math.round(performance.now() - startTime);

          if (shouldFail) {
            status = 'failed';
            notify();
            reject(new Error(`${name} failed to load`));
          } else {
            status = 'completed';
            notify();
            resolve(`${name} successfully loaded`);
          }
        }, delay);
      });
    }
  };
}

// ----------------------------------------------------
// 2. Application State & Task Initialization
// ----------------------------------------------------
const tasks = [
  createTask('Load Users', renderTasks),
  createTask('Load Posts', renderTasks),
  createTask('Load Comments', renderTasks)
];

const taskListEl = document.getElementById('taskList');
const allFinishedBannerEl = document.getElementById('allFinishedBanner');
const runAllBtn = document.getElementById('runAllConcurrentBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const compareBtn = document.getElementById('compareBtn');
const seqTimeEl = document.getElementById('seqTime');
const concurTimeEl = document.getElementById('concurTime');
const comparisonLogEl = document.getElementById('comparisonLog');
const runEventLoopBtn = document.getElementById('runEventLoopBtn');
const actualOutputEl = document.getElementById('actualOutput');
const eventLoopExplanationEl = document.getElementById('eventLoopExplanation');

// ----------------------------------------------------
// 3. UI Rendering
// ----------------------------------------------------
function renderTasks() {
  taskListEl.innerHTML = '';

  tasks.forEach((task) => {
    const item = document.createElement('div');
    item.className = 'task-item';

    const status = task.getStatus();
    const duration = task.getLoadingTime();
    const durationText = duration > 0 ? `${duration} ms` : '—';

    item.innerHTML = `
      <div class="task-info">
        <span class="task-title">${task.getName()}</span>
        <div class="task-meta">
          <span>Runs: <strong>${task.getCount()}</strong></span>
          <span>Time: <strong>${durationText}</strong></span>
        </div>
      </div>
      <div class="task-actions">
        <span class="task-status-badge status-${status}">${status}</span>
        <button class="btn btn-secondary btn-sm" data-action="run" data-name="${task.getName()}">Run</button>
        <button class="btn btn-secondary btn-sm" data-action="reset" data-name="${task.getName()}">Reset</button>
      </div>
    `;

    taskListEl.appendChild(item);
  });
}

// Event delegation for individual task buttons
taskListEl.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action;
  const name = btn.dataset.name;
  const task = tasks.find(t => t.getName() === name);
  if (!task) return;

  if (action === 'run') {
    allFinishedBannerEl.classList.add('hidden');
    try {
      await task.run();
    } catch {
      // Handled via task status
    }
  } else if (action === 'reset') {
    task.reset();
  }
});

// Reset all
resetAllBtn.addEventListener('click', () => {
  tasks.forEach(t => t.reset());
  allFinishedBannerEl.classList.add('hidden');
  seqTimeEl.textContent = '—';
  concurTimeEl.textContent = '—';
  comparisonLogEl.classList.add('hidden');
});

// Run all concurrently
runAllBtn.addEventListener('click', async () => {
  allFinishedBannerEl.classList.add('hidden');
  setButtonsDisabled(true);

  // Promise.allSettled guarantees waiting for all promises regardless of rejection
  await Promise.allSettled(tasks.map(task => task.run()));

  allFinishedBannerEl.classList.remove('hidden');
  setButtonsDisabled(false);
});

function setButtonsDisabled(disabled) {
  runAllBtn.disabled = disabled;
  compareBtn.disabled = disabled;
  document.querySelectorAll('.task-item button').forEach(b => b.disabled = disabled);
}

// ----------------------------------------------------
// 4. Sequential vs Concurrent Execution Comparison
// ----------------------------------------------------
compareBtn.addEventListener('click', async () => {
  setButtonsDisabled(true);
  allFinishedBannerEl.classList.add('hidden');
  comparisonLogEl.classList.remove('hidden');
  comparisonLogEl.innerHTML = '<p>Running sequential execution (task by task)...</p>';

  // --- Step 1: Sequential Execution ---
  const startSeq = performance.now();
  for (const task of tasks) {
    try {
      await task.run();
    } catch {
      // Error is tracked in task status
    }
  }
  const durationSeq = Math.round(performance.now() - startSeq);
  seqTimeEl.textContent = `${durationSeq} ms`;

  comparisonLogEl.innerHTML = '<p>Sequential finished. Now running concurrent execution (all at once)...</p>';
  await new Promise(r => setTimeout(r, 400)); // Short breather between tests

  // --- Step 2: Concurrent Execution ---
  const startConcur = performance.now();
  await Promise.allSettled(tasks.map(task => task.run()));
  const durationConcur = Math.round(performance.now() - startConcur);
  concurTimeEl.textContent = `${durationConcur} ms`;

  // Render comparison breakdown
  comparisonLogEl.innerHTML = `
    <h4>Comparison Result:</h4>
    <p>
      <strong>Sequential (${durationSeq} ms):</strong> Each task waited for the previous one to settle before starting. 
      Total duration is the sum of all individual durations (T1 + T2 + T3).
    </p>
    <p style="margin-top: 0.5rem;">
      <strong>Concurrent (${durationConcur} ms):</strong> All tasks were initiated immediately in parallel. 
      Total duration is governed by the single slowest task max(T1, T2, T3).
    </p>
    <p style="margin-top: 0.5rem; color: #34d399;">
      <strong>Speedup:</strong> Concurrent execution was ~${(durationSeq / durationConcur).toFixed(1)}x faster.
    </p>
  `;

  allFinishedBannerEl.classList.remove('hidden');
  setButtonsDisabled(false);
});

// ----------------------------------------------------
// 5. Event Loop Demo
// ----------------------------------------------------
runEventLoopBtn.addEventListener('click', () => {
  runEventLoopBtn.disabled = true;
  actualOutputEl.innerHTML = '';
  eventLoopExplanationEl.classList.remove('hidden');

  function logLive(msg) {
    console.log(msg);
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.textContent = msg;
    actualOutputEl.appendChild(line);
  }

  // --- Start of Event Loop Example ---
  logLive('1. [Sync] Script start');

  setTimeout(() => {
    logLive('2. [Task / Macrotask] setTimeout 1 (0ms)');
  }, 0);

  setTimeout(() => {
    logLive('3. [Task / Macrotask] setTimeout 2 (50ms)');
    runEventLoopBtn.disabled = false; // re-enable button after final timer
  }, 50);

  Promise.resolve().then(() => {
    logLive('4. [Microtask] Promise 1 resolved');
  }).then(() => {
    logLive('5. [Microtask] Promise 2 chained');
  });

  async function asyncDemo() {
    logLive('6. [Sync inside async] asyncDemo before await');
    await null;
    logLive('7. [Microtask] asyncDemo after await');
  }
  asyncDemo();

  logLive('8. [Sync] Script end');
  // --- End of Event Loop Example ---
});

// Initial render on page load
renderTasks();
