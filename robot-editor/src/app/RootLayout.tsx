import { Outlet } from '@tanstack/react-router'
import { AppHeader } from '../ui/AppHeader'

export function RootLayout() {
  return (
    <div className="app-shell">
      <AppHeader />
      <Outlet />
    </div>
  )
}
