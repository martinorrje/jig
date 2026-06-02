import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { RootLayout } from './RootLayout'
import { HomePage } from '../pages/HomePage'
import { SpecsPage } from '../pages/SpecsPage'

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
  path: '/specs/$projectId',
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
