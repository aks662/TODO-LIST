import { useState, useEffect, useRef } from 'react'
import './App.css' 

function App() {
  // ===========================================================================
  // 1. STATES & REFS
  // ===========================================================================

  // State for the main input field (adding new tasks)
  let [text, setText] = useState("")

  // Ref to handle focusing the input field when entering "Edit Mode"
  let editInputRef = useRef(null)

  // States for the editing functionality
  let [editId, setEditId] = useState(null)
  let [editText, setEditText] = useState("")

  // State for filtering and searching
  let [filter, setFilter] = useState("ALL")
  const [searchTerm, setSearchTerm] = useState("");

  // ===========================================================================
  // 2. DATA INITIALIZATION (LOCAL STORAGE)
  // ===========================================================================

  // local storage
  // let [list,setList]=useState([])
  // let [list,setList]=useState(JSON.parse(localStorage.getItem("todos")) || [])   
  // will work but render every time so using a arro function or lazy function 
  const [list, setList] = useState(() => {
    try {
      let savedList = localStorage.getItem("todos");
      let parsedList = savedList ? JSON.parse(savedList) : [];
      let data = (
        new Date().toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
      )
      // If the list is empty shows defaults
      if (parsedList.length === 0) {
        return (
          [
            { id: 1, task: "Wash clothes", isComplete: false, time: data },
            { id: 2, task: "Prepare for End Semester", isComplete: false, time: data },
            { id: 3, task: "Build a todo app", isComplete: false, time: data },
          ]
        );
      }
      return parsedList;
    } catch (error) {
      console.error("Failed to parse todos:", error);
      return [];
    }
  });

  // ===========================================================================
  // 3. DERIVED STATE & LOGIC
  // ===========================================================================

  // task counter: Calculates how many tasks are not yet completed
  let taskLeft = list.filter(item => !item.isComplete).length

  // filter state and search logic
  let filterList = (item) => {
    var matchStatus =
      filter === "ALL" ? true :
        filter === "ACTIVE" ? !item.isComplete :
          item.isComplete;
    let matchSearch = item.task.toLowerCase().includes(searchTerm.toLocaleLowerCase())
    return matchStatus && matchSearch
  }

  // ===========================================================================
  // 4. FUNCTIONS / EVENT HANDLERS
  // ===========================================================================

  // add: Logic to create a new todo object and add it to the list
  let addTask = () => {
    let newTodo = {
      id: Date.now(),
      task: text,
      isComplete: false,
      time: new Date().toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    }
    setList([...list, newTodo])
    setText("")
  }

  // setText: Handler for the main input change
  let handleChange = (e) => {
    setText(e.target.value)
  }

  // delete: Removes a task from the list by ID
  let deleteTask = (id) => {
    const updatedList = list.filter(item => item.id !== id);
    setList(updatedList);
  }

  // checkbox: Toggles the completion status of a task
  let toggleCheck = (id) => {
    let updatedList = list.map(item =>
      item.id === id ? { ...item, isComplete: !item.isComplete } : item
    )
    setList(updatedList)
  }

  // start edit: Initializes edit mode with existing task data
  let startEdit = (id, currentTask) => {
    setEditId(id)
    setEditText(currentTask)
  }

  // saving when done: Updates the task text and exits edit mode
  let saveEdit = (id) => {
    let updatedList = list.map(item =>
      item.id === id ? { ...item, task: editText } : item
    )
    setList(updatedList)
    setEditId(null)
  }

  // clear function: Removes all completed tasks from the list
  let handleClear = () => {
    let updatedList = list.filter(item => !item["isComplete"])
    setList(updatedList)
  }

  // ===========================================================================
  // 5. SIDE EFFECTS (useEffect)
  // ===========================================================================

  // local storage: Syncs the list state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(list))
  }, [list])

  // hooks to focus input when edit: Automatically focuses the input when editId changes
  useEffect(() => {
    if (editId !== null) {
      editInputRef.current.focus()
    }
  }, [editId])

  // ===========================================================================
  // 6. RENDER (JSX)
  // ===========================================================================
  return (
    <div className="app-container">
      <div className="todo-card">
        <h2 className="header-title">MY <span className="highlight">TODO</span> LIST</h2>

        {/* Main Task Input */}
        <div className="input-row">
          <input
            className="main-input"
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            onChange={(e) => { handleChange(e) }}
            value={text}
            placeholder="add tasks..."
            type="text"
          />
          <button className="add-btn" disabled={text.trim().length === 0} onClick={addTask}>ADD</button>
        </div>

        {/* filter controls */}
        <div className="filter-row">
          <button className={`filter-btn ${filter === "ALL" ? "active" : ""}`} onClick={() => setFilter("ALL")}>📋ALL</button>
          <button className={`filter-btn ${filter === "ACTIVE" ? "active" : ""}`} onClick={() => setFilter("ACTIVE")}>⌛️ACTIVE</button>
          <button className={`filter-btn ${filter === "COMPLETED" ? "active" : ""}`} onClick={() => setFilter("COMPLETED")}>✅DONE</button>
        </div>

        {/* task counter display */}
        <div className="stats-text">TASKS LEFT : <strong>{taskLeft}</strong></div>

        {/* search button / input */}
        <form>
          <input
            className="search-field"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value) }}
            stykle={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            placeholder='search task...'
          />
        </form>

        {/* clear completed tasks button */}
        <button className="clear-btn" onClick={handleClear}>CLEAR COMPLETED</button>

        <div className="list-wrapper">
          <ul className="task-list">
            {list.length === 0 ? (
              <p className="empty-msg"> ADD TASKS </p>
            ) : (
              list
                .filter(item => filterList(item))
                .map(item =>
                  <li className="task-item" key={item.id} style={{ opacity: item.isComplete ? 0.6 : 1 }}>
                    {
                      item.id === editId ? (
                        <div className="edit-container">
                          {/* ---EDIT MODE--- */}
                          <input
                            className="edit-field"
                            ref={editInputRef}
                            type="text"
                            value={editText}
                            onChange={(e) => { setEditText(e.target.value) }}
                            // enter key update
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(item.id)}
                          />
                          <button className="save-btn" onClick={() => saveEdit(item.id)}>SAVE</button>
                          <button className="cancel-btn" onClick={() => setEditId(null)}>X</button>
                        </div>
                      ) : (
                        <div className="item-content">
                          {/* ---NORMAL MODE--- */}
                          <div className="item-left">
                            <input
                              className="checkbox-ui"
                              onChange={() => toggleCheck(item.id)}
                              checked={item.isComplete}
                              type="checkbox"
                            />
                            <div className="text-container">
                              <span className="item-text" style={{ textDecoration: item.isComplete ? "line-through" : "none" }}>
                                {item.task}
                              </span>
                              <small className="item-time">{item.time}</small>
                            </div>
                          </div>
                          <div className="item-actions">
                            <button className="edit-action" onClick={() => { startEdit(item.id, item.task) }}>EDIT</button>
                            <button className="delete-action" onClick={() => deleteTask(item.id)}>DEL</button>
                          </div>
                        </div>
                      )
                    }
                  </li>
                )
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App