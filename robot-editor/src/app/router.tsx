import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { HomePage } from '../pages/HomePage'
import { SpecsPage } from '../pages/SpecsPage'
import { AppHeader } from '../ui/AppHeader'

function RootLayout() {
  return (
    <div className="app-shell">
      <AppHeader />
      <Outlet />
    </div>
  )
}

const rootRoute = createRootRoute({
  component: RootLayout,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const specsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/specs/new',
  component: SpecsPage,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  specsRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
