"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, UserX } from "lucide-react"
import { terminateUser } from "@/lib/actions/users"

interface TerminateUserButtonProps {
  userId: string
  userName: string
}

export function TerminateUserButton({ userId, userName }: TerminateUserButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleTerminate = async () => {
    setIsLoading(true)
    try {
      await terminateUser(userId)
      router.refresh()
    } catch (error) {
      console.error("Failed to terminate user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Terminating...
            </>
          ) : (
            <>
              <UserX className="mr-2 h-4 w-4" />
              Terminate
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Terminate User Access</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to terminate access for <strong>{userName}</strong>? This will immediately revoke
            their access to the system. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleTerminate}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Terminate Access
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
