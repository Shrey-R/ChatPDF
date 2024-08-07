import { trpc } from "@/app/_trpc/client";
import Message from "./Message";
import Skeleton from "react-loading-skeleton";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

interface MessageProps {
  id: string;
  createdAt: string;
  text: string;
  isUserMessage: boolean;
}

const Messages = ({ fileId }: { fileId: string }) => {
  const [dbMessages, setDbMessages] = useState<MessageProps[] | undefined>();
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

  // const messages = data?.pages.flatMap((page) => page.messages);

  useEffect(() => {
    if (data) {
      const messages = data.pages.flatMap((page) => page.messages);
      setDbMessages(messages);
    }
    console.log(dbMessages)
  }, [data]);

  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
      {dbMessages && dbMessages.length > 0 ? (
        dbMessages.map((message, i) => {
          const isNextMessageSamePerson =
          dbMessages[i - 1]?.isUserMessage === dbMessages[i]?.isUserMessage;
          if (i === dbMessages.length - 1)
            return (
              <Message
                key={message.id}
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
              />
            );
          else
            return (
              <Message
                key={message.id}
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
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
