import { redirect } from "next/navigation"

export default function AdminSettingsPage() {
  // Redirect to the main settings page
  redirect("/settings")
}
