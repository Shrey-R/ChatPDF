import getSession from '@/lib/getSession';
// import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import {TRPCError, initTRPC} from '@trpc/server';

const t = initTRPC.create();
const middleware = t.middleware;

const isAuth = middleware(async (opts) => {
    // const {getUser} = getKindeServerSession();
    // const user = await getUser();
    const session = await getSession();
    const user = session?.user;

    if(!user) throw new TRPCError({code:"UNAUTHORIZED"});
    
    return opts.next({
        ctx : {
            userId: user.id,
            user
        }
    })
})

export const router = t.router;
export const publicProcedure =  t.procedure;
export const privateProcedure = t.procedure.use(isAuth)