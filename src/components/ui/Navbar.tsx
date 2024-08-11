import Link from "next/link"
import MaxWidthWrapper from "../MaxWidthWrapper"
import { buttonVariants } from "./button"
import { SignInBtn } from "../SignInBtn";
import { SignOutBtn } from "../SignOutBtn"
import getSession from "@/lib/getSession";
import UserAccountNav from "./UserAccNav";

const Navbar = async () => {
    const session = await getSession();
    const user = session?.user;
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
        <MaxWidthWrapper>
            <div className="flex h-14 items-center justify-between border-b border-zinc-200">
                <Link href='/' className="flex z-40 font-semibold">
                    <span>ChatPDF</span>
                </Link>
                {/* todo: add mobile navbar */}
                <div className="space-x-5 flex items-center">
                    {user && <Link href='/dashboard' className={buttonVariants({
                            variant:'ghost',
                            size:'sm'
                        })}>
                            My Files
                    </Link>}
                    <Link href='/pricing' className={buttonVariants({
                            variant:'ghost',
                            size:'sm'
                        })}>
                        Pricing
                    </Link>
                    {user ? <UserAccountNav email={user.email??""} name={user.name??""}/> :<SignInBtn/>}
                </div>
            </div>
        </MaxWidthWrapper>
    </nav>
  )
}

export default Navbar