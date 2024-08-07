import { db } from "@/db";
import { privateProcedure, publicProcedure, router } from "./trpc";
// import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { TRPCError } from "@trpc/server";
import getSession from "@/lib/getSession";
import { z } from "zod";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    // const {getUser} = getKindeServerSession();
    // const user = await getUser();
    const session = await getSession();
    const user = session?.user;
    if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

    //check if user is in db
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });
    if (!dbUser) {
      //create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    const files = await db.file.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return files;
  }),

  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      await db.file.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),

  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),

  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });

      if (!file) return { status: "PENDING" as const };

      return { status: file.uploadStatus };
    }),
  
  getFileMessages: privateProcedure.input(z.object({
    limit: z.number().min(1).max(100).nullish(),
    cursor: z.string().nullish(),
    fileId: z.string()
  })).query(async ({input,ctx})=>{
    const {userId} = ctx;
    const {fileId,cursor} = input;
    const limit = input.limit ?? 10;

    const file = await db.file.findMany({
      where:{
        id:fileId,
        userId
      }
    })
    if(!file) throw new TRPCError({code:'NOT_FOUND'})

    const messages = await db.message.findMany({
      where:{
        fileId,
      },
      orderBy: {
        createdAt:'desc'
      },
      cursor: cursor? {id:cursor} : undefined,
      select: {
        id:true,
        isUserMessage:true,
        createdAt:true,
        text:true
      }
    })

    let nextCursor : typeof cursor | undefined = undefined;
    if(messages.length>limit){
      const nextItem = messages.pop();
      nextCursor = nextItem?.id
    }
    return {
      messages,
      nextCursor,
    }
  })
});

export type AppRouter = typeof appRouter;
