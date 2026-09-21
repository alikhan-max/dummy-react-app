
import React, { useEffect, useState } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const [server, setServer] = useState(null);
  const [checking, setChecking] = useState(false);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // ------------------------------------
  // HELPER: READ API RESPONSE
  // ------------------------------------

  async function readResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed.');
    }

    return data;
  }

  // ------------------------------------
  // LOAD TASKS FROM POSTGRESQL
  // ------------------------------------

  async function loadTasks() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tasks', {
        cache: 'no-store'
      });

      const data = await readResponse(response);

      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------
  // CHECK NODE.JS SERVER
  // ------------------------------------

  async function checkServer() {
    setChecking(true);

    try {
      const response = await fetch('/api/status', {
        cache: 'no-store'
      });

      const data = await readResponse(response);

      setServer(data);
    } catch {
      setServer(null);
    } finally {
      setChecking(false);
    }
  }

  // Load data when the app opens.
  useEffect(() => {
    loadTasks();
    checkServer();
  }, []);

  // ------------------------------------
  // ADD TASK
  // ------------------------------------

  async function addTask(event) {
    event.preventDefault();

    if (!newTask.trim() || busy || loading) return;

    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: newTask.trim()
        })
      });

      const task = await readResponse(response);

      setTasks((current) => [task, ...current]);
      setNewTask('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // ------------------------------------
  // MARK TASK COMPLETE / INCOMPLETE
  // ------------------------------------

  async function toggleTask(task) {
    if (busy || loading) return;

    setBusy(true);
    setError('');

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          done: !task.done
        })
      });

      const updatedTask = await readResponse(response);

      setTasks((current) =>
        current.map((item) =>
          item.id === updatedTask.id
            ? updatedTask
            : item
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // ------------------------------------
  // DELETE TASK
  // ------------------------------------

  async function deleteTask(id) {
    if (busy || loading) return;

    setBusy(true);
    setError('');

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        await readResponse(response);
      }

      setTasks((current) =>
        current.filter((task) => task.id !== id)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // ------------------------------------
  // DASHBOARD STATISTICS
  // ------------------------------------

  const completed = tasks.filter((task) => task.done).length;

  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  // ------------------------------------
  // APPLICATION UI
  // ------------------------------------

  return (
    <div className="app">

      <header className="navbar">
        <div className="brand">
          <span className="brand-icon">V</span>
          <span>
            VELOCITY <span className="muted">/ LAUNCHPAD</span>
          </span>
        </div>

        <span className="nav-badge">
          DEMO APPLICATION
        </span>
      </header>

      <main className="container">

        <section className="hero">

          <div className="eyebrow">
            <span className="pulse" />
            BUILT WITH REACT. POWERED BY NODE.JS.
          </div>

          <h1>
            From code to production.
            <br />
            <span className="gradient-text">
              Without the complexity.
            </span>
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
              <span className="eyebrow">
                01 / LIVE INFRASTRUCTURE
              </span>

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
              <span className="stat-label">
                SERVER STATUS
              </span>

              <div className="stat-value">
                <span className={server ? 'green' : 'orange'}>
                  ●
                </span>

                {server
                  ? 'Online'
                  : checking
                    ? 'Checking'
                    : 'Offline'}
              </div>

              <span className="stat-description">
                Live response from the backend
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">
                RUNTIME
              </span>

              <div className="stat-value">
                {server ? server.runtime : '—'}
              </div>

              <span className="stat-description">
                Persistent Node.js process
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">
                SERVER UPTIME
              </span>

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
              <span className="eyebrow">
                02 / POSTGRESQL DATABASE
              </span>

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

            <p
              style={{
                color: '#4adea3',
                fontSize: '12px',
                marginTop: '20px'
              }}
            >
              ● Tasks stored in PostgreSQL
            </p>

            {error && (
              <div
                role="alert"
                style={{
                  color: '#ff8a8a',
                  marginTop: '16px'
                }}
              >
                {error}

                <button
                  className="refresh"
                  style={{ marginLeft: '12px' }}
                  onClick={loadTasks}
                  disabled={loading || busy}
                >
                  Retry
                </button>
              </div>
            )}

            <form onSubmit={addTask} className="task-form">

              <input
                value={newTask}
                onChange={(event) =>
                  setNewTask(event.target.value)
                }
                placeholder="Add a new task..."
                aria-label="New task"
                maxLength={200}
                disabled={busy || loading}
              />

              <button
                type="submit"
                disabled={busy || loading}
              >
                {busy ? 'Saving...' : '+ Add task'}
              </button>

            </form>

            <div className="task-list">

              {loading && (
                <p className="empty">
                  Loading tasks from PostgreSQL...
                </p>
              )}

              {!loading && tasks.map((task) => (

                <div className="task" key={task.id}>

                  <label>

                    <input
                      type="checkbox"
                      checked={task.done}
                      disabled={busy}
                      onChange={() => toggleTask(task)}
                    />

                    <span className={task.done ? 'done' : ''}>
                      {task.text}
                    </span>

                  </label>

                  <button
                    className="delete"
                    disabled={busy}
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.text}`}
                  >
                    ×
                  </button>

                </div>

              ))}

              {!loading && !error && tasks.length === 0 && (
                <p className="empty">
                  No tasks yet. Add your first task!
                </p>
              )}

            </div>

          </div>

        </section>

        <footer>
          <span>
            Cloudways Velocity / Demo Application
          </span>

          <span>
            React + Express + PostgreSQL
          </span>
        </footer>

      </main>
    </div>
  );
}

export default App;
