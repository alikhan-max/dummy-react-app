
import React, { useEffect, useState } from 'react';

const starterTasks = [
  { id: 1, text: 'Build my React application', done: true },
  { id: 2, text: 'Push code to GitHub', done: true },
  { id: 3, text: 'Deploy on Cloudways Velocity', done: false },
  { id: 4, text: 'Share my live application', done: false },
];

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem('velocity-demo-tasks')
      );

      return Array.isArray(saved) ? saved : starterTasks;
    } catch {
      return starterTasks;
    }
  });

  const [newTask, setNewTask] = useState('');
  const [server, setServer] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      'velocity-demo-tasks',
      JSON.stringify(tasks)
    );
  }, [tasks]);

  async function checkServer() {
    setChecking(true);

    try {
      const response = await fetch('/api/status', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Server unavailable');
      }

      const data = await response.json();
      setServer(data);
    } catch {
      setServer(null);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    checkServer();
  }, []);

  function addTask(event) {
    event.preventDefault();

    if (!newTask.trim()) return;

    setTasks((current) => [
      {
        id: Date.now(),
        text: newTask.trim(),
        done: false,
      },
      ...current,
    ]);

    setNewTask('');
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, done: !task.done }
          : task
      )
    );
  }

  function deleteTask(id) {
    setTasks((current) =>
      current.filter((task) => task.id !== id)
    );
  }

  const completed = tasks.filter((task) => task.done).length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span className="brand-icon">V</span>
          <span>VELOCITY <span className="muted">/ LAUNCHPAD</span></span>
        </div>

        <span className="nav-badge">DEMO APPLICATION</span>
      </header>

      <main className="container">
        <section className="hero">
          <div className="eyebrow">
            <span className="pulse" />
            BUILT WITH REACT - POWERED BY NODE.JS.
          </div>

          <h1>
            From code to production.
            <br />
            <span className="gradient-text">Without the complexity.</span>
          </h1>

          <p>
            A real React application running on Cloudways Velocity.
            Build, deploy, and scale your apps while we take care
            of the infrastructure.
          </p>

          <div className="hero-actions">
            <a
              className="button primary"
              href="https://www.cloudways.com/en/velocity.php"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore Velocity ↗
            </a>

            <a
              className="button secondary"
              href="https://github.com/alikhan-max/dummy-react-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Source Code ↗
            </a>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">01 / LIVE INFRASTRUCTURE</span>
              <h2>Application health</h2>
            </div>

            <button
              className="refresh"
              onClick={checkServer}
              disabled={checking}
            >
              {checking ? 'Checking...' : '↻ Refresh status'}
            </button>
          </div>

          <div className="stats">
            <div className="stat-card">
              <span className="stat-label">SERVER STATUS</span>
              <div className="stat-value">
                <span className={server ? 'green' : 'orange'}>
                  ●
                </span>
                {server ? 'Online' : checking ? 'Checking' : 'Offline'}
              </div>
              <span className="stat-description">
                Live response from the backend
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">RUNTIME</span>
              <div className="stat-value">
                {server ? server.runtime : '—'}
              </div>
              <span className="stat-description">
                Persistent Node.js process
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">SERVER UPTIME</span>
              <div className="stat-value">
                {server ? `${server.uptime}s` : '—'}
              </div>
              <span className="stat-description">
                Since the process started
              </span>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">02 / INTERACTIVE DEMO</span>
              <h2>Your deployment checklist</h2>
            </div>

            <span className="task-count">
              {completed} / {tasks.length} completed
            </span>
          </div>

          <div className="task-panel">
            <div className="progress-header">
              <span>Overall progress</span>
              <strong>{progress}%</strong>
            </div>

            <div className="progress-bar">
              <div style={{ width: `${progress}%` }} />
            </div>

            <form onSubmit={addTask} className="task-form">
              <input
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                placeholder="Add a new task..."
                aria-label="New task"
              />

              <button type="submit">+ Add task</button>
            </form>

            <div className="task-list">
              {tasks.map((task) => (
                <div className="task" key={task.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                    />

                    <span className={task.done ? 'done' : ''}>
                      {task.text}
                    </span>
                  </label>

                  <button
                    className="delete"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.text}`}
                  >
                    ×
                  </button>
                </div>
              ))}

              {tasks.length === 0 && (
                <p className="empty">
                  No tasks yet. Add one above!
                </p>
              )}
            </div>
          </div>
        </section>

        <footer>
          <span>Cloudways Velocity / Demo Application</span>
          <span>React + Vite + Express</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
