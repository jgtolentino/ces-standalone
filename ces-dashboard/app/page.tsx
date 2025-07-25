import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to overview page as default
  redirect('/ces/overview')
}