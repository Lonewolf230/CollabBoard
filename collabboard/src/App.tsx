import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import AuthPage from './pages/AuthPage'
import WhiteBoard from './pages/WhiteBoard'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<AuthPage/>}/>
          <Route path='/board' element={<WhiteBoard/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
