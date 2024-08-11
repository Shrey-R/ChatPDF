import { trpc } from "@/app/_trpc/client";
import Message from "./Message";
import Skeleton from "react-loading-skeleton";
import { Loader2, MessageSquare } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "./ChatContext";
import {useIntersection} from '@mantine/hooks'

interface MessageProps {
  fileId: string 
}

const Messages = ({ fileId }: MessageProps ) => {
  const {isLoading:isAiThinking} = useContext(ChatContext)
  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: 10,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      }
    );

  const messages = data?.pages.flatMap((page) => page.messages);

  const loadingMessage = {
    createdAt: new Date().toISOString(),
    id:'loading-message',
    isUserMessage:false,
    text: (
      <span className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    )
  }

  const combinedMessges = [
    ...(isAiThinking? [loadingMessage]:[]),
    ...(messages ?? []),
  ]

  const lastMessageRef = useRef<HTMLDivElement>(null);

  const {ref,entry} = useIntersection({
    root:lastMessageRef.current,
    threshold:1
  })

  useEffect(()=>{
    if(entry?.isIntersecting){
      fetchNextPage()
    }
  },[entry,fetchNextPage])

  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
      {combinedMessges && combinedMessges.length > 0 ? (
        combinedMessges.map((message, i) => {
          const isNextMessageSamePerson =
          combinedMessges[i - 1]?.isUserMessage === combinedMessges[i]?.isUserMessage;
          if (i === combinedMessges.length - 1)
            return (
              <Message
                ref={ref}
                message={message}
                isNextMessageSamePerson={
                  isNextMessageSamePerson
                }
                key={message.id}
              />
            );
          else
            return (
              <Message
                message={message}
                isNextMessageSamePerson={
                  isNextMessageSamePerson
                }
                key={message.id}
              />
            );
        })
      ) : isLoading ? (
        <div className="flex justify-center items-center">
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="h-14 w-14 text-blue-500" />
          <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
