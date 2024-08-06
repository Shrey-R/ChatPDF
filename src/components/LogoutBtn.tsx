import {LogoutLink} from "@kinde-oss/kinde-auth-nextjs/components";
import { buttonVariants } from './ui/button'


const LogoutBtn = async () => {

  return (
    <LogoutLink className={buttonVariants({
        variant:'ghost',
        size:'sm'
    })}>
        Log out
    </LogoutLink>
  )
}

export default LogoutBtn