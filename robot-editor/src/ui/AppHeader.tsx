// src/ui/AppHeader.tsx
import { Link } from '@tanstack/react-router'
import { useAuthStore } from '../store/authStore'

export function AppHeader() {
  const ready = useAuthStore((state) => state.ready)
  const user = useAuthStore((state) => state.user)
  const signInWithGitHub = useAuthStore((state) => state.signInWithGitHub)
  const signOut = useAuthStore((state) => state.signOut)

  return (
    <header className="topbar">
      <Link className="brand-lockup" to="/">
        <span className="brand-mark">J</span>
        <span>Jig</span>
      </Link>

      <div className="account-controls">
        <span className="auth-status">
          {user ? user.email : 'Editing locally'}
        </span>

        <button
          className="auth-button"
          type="button"
          disabled={!ready}
          onClick={() => {
            if (user) void signOut()
            else void signInWithGitHub()
          }}
        >
          {user ? 'Sign out' : 'Sign in'}
        </button>
      </div>
    </header>
  )
}