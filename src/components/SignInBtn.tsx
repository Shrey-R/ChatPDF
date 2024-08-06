import { signIn } from "@/auth"
import { Button, buttonVariants } from "./ui/button"
 
export async function SignInBtn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("github , google", { redirectTo: "/dashboard" })
      }}
    >
      <div className="flex">
      <Button type="submit" className={buttonVariants({
                size:'sm',
                className:'bg-slate-900 hover:bg-slate-700'
            })}>
            Signin
        </Button>
        </div>
    </form>
  )
} 