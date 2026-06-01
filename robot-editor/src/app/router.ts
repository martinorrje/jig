import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from '@tanstack/react-router'
import { HomePage } from '../pages/HomePage'

const rootRoute = createRootRoute({
  component: Outlet,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const newProjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/new',
  component: lazyRouteComponent(() => import('../pages/ViewerPage'), 'ViewerPage'),
})

const savedProjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId',
  component: lazyRouteComponent(() => import('../pages/ViewerPage'), 'ViewerPage'),
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  newProjectRoute,
  savedProjectRoute,
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
