"use client"

import { Suspense } from "react"
import AcceptInvitePage from "./page-component"

export default function AcceptInviteWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AcceptInvitePage />
    </Suspense>
  )
}
