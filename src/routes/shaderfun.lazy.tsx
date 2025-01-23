import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/shaderfun')({
  component: About,
})

function About() {
  return <div>Hello "/about"!</div>
}
