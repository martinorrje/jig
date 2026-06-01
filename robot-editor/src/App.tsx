import { useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './app/router'
import { useAuthStore } from './store/authStore'
import './App.css'

function App() {
  const initAuth = useAuthStore((state) => state.initAuth)

  useEffect(() => initAuth(), [initAuth])

  return <RouterProvider router={router} />
}

export default App