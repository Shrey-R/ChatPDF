import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { auth } from "@/auth";
import getSession from "@/lib/getSession";


const DashboardPage = async () => {
  
    // const {getUser} = getKindeServerSession();  

    // const user = await getUser();

    // if(!user || !user.id) redirect('/auth-callback?origin=dashboard')

    // const dbUser = await db.user.findFirst({
    //   where: {
    //     id: user.id
    //   }
    // })
    //eventual consistency of user to DB
    // if(!db.user) redirect('/auth-callback?origin=dashboard')

    const session = await getSession();
    const user = session?.user;

    if(!user){
      redirect('/api/auth/signin?callbackUrl=/dashboard')
    }
    
  return (
    <Dashboard/>
  )
}

export default DashboardPage