import { signOut } from "@/auth"
import { Button, buttonVariants } from "./ui/button"

export async function SignOutBtn() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut({ redirectTo: "/" })
      }}
    >
        <Button type="submit" className={buttonVariants({
                variant:"secondary",
                size:'sm',
                className:'hover:bg-gray-200'
            })}>
            Sign Out
        </Button>
    </form>
  )
}