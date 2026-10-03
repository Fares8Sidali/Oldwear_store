import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import './App.css'

function App() {
  return (
    <header>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button>Sign In</button>
        </SignInButton>

        <SignUpButton mode="modal">
          <button>Sign Up</button>
        </SignUpButton>
      </Show>

      <Show when="signed-in">
        <UserButton />
      </Show>
    </header>
  )
}

export default App
