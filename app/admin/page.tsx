import { redirect } from "next/navigation"

export default function AdminPage() {
  // Redirect to the main admin page (feedback management)
  redirect("/admin/feedback")
}
