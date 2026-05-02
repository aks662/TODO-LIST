import { useState,useEffect ,useRef} from 'react'



function App() {

// local storage
// let [list,setList]=useState([])
// let [list,setList]=useState(JSON.parse(localStorage.getItem("todos")) || [])   //will work but render every time so using a arro function or lazy function 
  let editInputRef=useRef(null)
  let [text,setText]=useState("")

  const [list, setList] = useState(() => {
  try {
    let savedList = localStorage.getItem("todos");
    let parsedList = savedList ? JSON.parse(savedList) : [];

    let data=
    (
      new Date().toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',hour12:true })
    )

    // If the list is empty shows defaults
    if (parsedList.length === 0) {
      return (
        [
        { id: 1, task: "Wash clothes", isComplete: false ,time: data },
        { id: 2, task: "Prepare for End Semester", isComplete: false , time: data},
        { id: 3, task: "Build a todo app", isComplete: false, time: data},
      ]
    );
    }
    return parsedList;


  } catch (error) {
    console.error("Failed to parse todos:", error);
    return [];
  }
  });
      

// setText
  let handleChange=(e)=>{
    setText(e.target.value)
  }
// delete
  let deleteTask=(id)=>{
      const updatedList = list.filter(item => item.id !== id);
    setList(updatedList);
  }
// add
  let addTask=()=>{
    
    let newTodo={
      id:Date.now(),
      task:text,
      isComplete:false,
      time: new Date().toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',hour12:true })
 
      
    }
    setList([...list,newTodo])
    setText("")
  }
// checkbox
  let toggleCheck=(id)=>{
    let updatedList=list.map(item=>
      item.id===id ? {...item,isComplete:!item.isComplete} : item
    )
    setList(updatedList)
  }
// local storage
  useEffect(()=>{
    localStorage.setItem("todos",JSON.stringify(list))
  },[list])

// edit task 
  let [editId,setEditId]=useState(null)
  let [editText,setEditText]=useState("")


// start edit
  let startEdit=(id,currentTask)=>{
        setEditId(id)
        setEditText(currentTask)
}
// saving when done
  let saveEdit=(id)=>{
  let updatedList=list.map(item=>
    item.id===id ? {...item,task:editText} : item

  )
  setList(updatedList)
  setEditId(null)
  }

// filter state and search
  let [filter,setFilter]=useState("ALL")
  const [searchTerm,setSearchTerm]=useState("");

  let filterList=(item)=>{
    var matchStatus =
    filter==="ALL" ? true : 
    filter==="ACTIVE" ? !item.isComplete : 
    item.isComplete;

    let matchSearch=item.task.toLowerCase().includes(searchTerm.toLocaleLowerCase())

    return matchStatus && matchSearch
    
  }

// task counter
  let taskLeft=list.filter(item=> !item.isComplete).length

// clear function
  let handleClear=()=>{
    let updatedList=list.filter(item=>!item["isComplete"])
    setList(updatedList)
  }

// hooks to focus input when edit 
  useEffect(()=>{
    if(editId!==null){
      editInputRef.current.focus()
    }
  },[editId])
  
  return (
    <div>
      <h2>MY TODO LIST</h2>
      <input onKeyDown={(e)=>e.key==="Enter" && addTask()} onChange={(e)=>{handleChange(e)}} value ={text} placeholder="add tasks..." type="text" />
      <button  disabled={text.trim().length===0} onClick={addTask} >ADD</button>

      {/* filter  */}
      <div>
        <button onClick={() => setFilter("ALL")}>📋ALL</button>
        <button onClick={() => setFilter("ACTIVE")}>⌛️ACTIVE</button>
        <button onClick={() => setFilter("COMPLETED")}>✅COMPLETED</button>
      </div>
      {/* task counter */}
      <div>TASKS LEFT : {taskLeft}</div>

      {/* search button */}
      <form><input
      value={searchTerm}
      onChange={(e)=>{setSearchTerm(e.target.value)}}
      stykle={{width: '100%', padding: '8px', marginBottom: '10px'}}
      placeholder='search task...'
      ></input>

      </form>

      {/* clear button */}
      <button onClick={handleClear}>CLEAR</button>

      <div>
        <ul>
          {list.length===0 ? <p> ADD TASKS </p>  : 

          list
          .filter(item=>filterList(item))
          .map(item=>
            <li key={item.id}  style={{ opacity: item.isComplete ? 0.6 : 1 }}>
               {
               item.id===editId ? (
                 <>
                 {/* ---EDIT--- */}
                <input
                  ref={editInputRef}
                  type="text"
                  value={editText}
                  onChange={(e)=>{setEditText(e.target.value)}}
                  // enter key update
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(item.id)}
                  />
                <button onClick={()=>saveEdit(item.id)}>SAVE</button>
                <button onClick={()=>setEditId(null)}>CANCEL</button>
              </>
                
              )  :  (

              <>
                {/* ---NORMAL--- */}
                <input onChange={() => toggleCheck(item.id)} checked={item.isComplete} type="checkbox"></input>
                <span style={{ textDecoration: item.isComplete ? "line-through" : "none" }}> {item.task} </span>
                <button onClick={()=>deleteTask(item.id)}>DELETE</button>
                <button onClick={()=>{startEdit(item.id,item.task)}}>EDIT</button>
                <small style={{color:"grey",marginLeft:"10px"}}>{item.time}</small>
              </>
              )
             } 
            </li>
            )}
        </ul>
        </div>


    </div>
    
  )
}

export default App
