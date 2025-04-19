import { Toaster } from "react-hot-toast"
import KanbanBoard from "./components/KanbanBoard"



const App = () => {
  return (
    <div>
      <KanbanBoard />
      <Toaster/>
    </div>
  )
}

export default App