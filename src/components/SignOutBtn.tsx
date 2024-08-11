import { signOut } from "@/auth";
import { Button, buttonVariants } from "./ui/button";

export async function SignOutBtn() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
      className="w-full"
    >
      <Button
        type="submit"
        size="sm"
        variant="secondary"
        className="w-full bg-inherit flex justify-start h-5 p-0"
      >
        Sign Out
      </Button>
    </form>
  );
}
