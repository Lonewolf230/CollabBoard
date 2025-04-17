import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import AuthPage from './pages/AuthPage'
import WhiteBoard from './pages/WhiteBoard'
import AuthProvider from './providers/AuthProvider'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './utils/ProtectedRoute'
import Error from './components/Error'

function App() {

  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path='/' element={
              <AuthPage/>
              }/>
            <Route path='/dashboard' element={
                <ProtectedRoute>
                  <Dashboard/>
                </ProtectedRoute>
              }/>
            <Route path='/board' element={<Error message={'Sorry but the whiteboard does not exist'}/>}/>  
            <Route path='/board/:boardId' element={
                <ProtectedRoute>
                  <WhiteBoard/>
                </ProtectedRoute>
              }
              errorElement={<Error message={'Sorry but the whiteboard does not exist'}/>}
              />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App
