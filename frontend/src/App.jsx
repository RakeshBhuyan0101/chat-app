
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import Signup from './pages/Signup'
import SigninPage from './pages/SigninPage'
import Settings from './pages/Settings'
import ProfilePage from './pages/ProfilePage'
import { useAuthStore } from './store/useAuthStore'
import { useEffect } from 'react'
import { Loader } from 'lucide-react'
import { useThemStore } from './store/useThemeStore'


function App() {

  const {authUser , cheackAuth , isCheackingAuth , onlineUsers} = useAuthStore()

  console.log(onlineUsers)
  const {theme} = useThemStore()
  useEffect(() => {
    cheackAuth()
  } , [cheackAuth])

  if (isCheackingAuth && !authUser) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader className='size-10 animate-spin '/>
      </div>
    )
  }
  return (
    <div data-theme = {theme}>
      <Navbar/>

      <Routes>
        <Route path='/' element={ authUser ? <HomePage/> : <Navigate to="/signin" />} />
        <Route path='/signup' element={ !authUser ? <Signup/> : <Navigate to="/"/>} />
        <Route path='/signin' element={ !authUser ?  <SigninPage/> : <Navigate to="/"/> } />
        <Route path='/settings' element={<Settings/>} />
        <Route path='/profile' element={ authUser ? <ProfilePage/> : <Navigate to="/signin"/> } />
      </Routes>
    </div>
  )
}

export default App
