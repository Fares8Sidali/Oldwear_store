import { Show, SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/react'
import PageLoader from "./components/PageLoader"
import Layout from './components/Layout';

function App() {

  const {isLoaded} = useAuth()

  if(!isLoaded) return <PageLoader />
  return (
    <Layout>
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
      <button className="btn btn-primary">Click me</button>
      <button className="btn btn-xs">Xsmall</button>
      <button className="btn btn-sm">Small</button>
      <button className="btn">Medium</button>
      <button className="btn btn-lg">Large</button>
      <button className="btn btn-xl">Xlarge</button>

    </Layout>
  ) 
}

export default App
