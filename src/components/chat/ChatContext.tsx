import { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});

interface Props {
  fileId: string;
  children: ReactNode;
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const backupMessage = useRef("");

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.body;
    },

    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage("");

      //optimistic updates
      //step 1 Cancel any outgoing refetches to avoid overwriting optimistic update
      await utils.getFileMessages.cancel();

      //step 2 Snapshot the previous value
      const previousMessage = utils.getFileMessages.getInfiniteData();

      //step 3 Optimistically update to the new value
      utils.getFileMessages.setInfiniteData({ fileId, limit: 10 }, (old) => {
        if (!old) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        let newPages = [...old.pages];
        let latestPage = newPages[0]!;
        latestPage.messages = [
          {
            createdAt: new Date().toISOString(),
            id: crypto.randomUUID(),
            text: message,
            isUserMessage: true,
          },
          ...latestPage.messages,
        ];

        newPages[0] = latestPage;

        return {
          ...old,
          pages: newPages,
        };
      });
      setIsLoading(true);

      return {
        previousMessage:
          previousMessage?.pages.flatMap((page) => page.messages) ?? [],
      };
    },

    onSuccess: async (stream) => {
      setIsLoading(false);

      if (!stream) {
        return toast({
          title: "There was a problem send this message again",
          description: "Please refresh this page and try again",
          variant: "destructive",
        });
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      //accumulated response
      let accResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        accResponse += chunkValue;

        //append chunk value to actual response
        utils.getFileMessages.setInfiniteData({ fileId, limit: 10 }, (old) => {
          if (!old) return { pages: [], pageParams: [] };

          let isAiResponseCreated = old.pages.some((page) =>
            page.messages.some((message) => message.id === "ai-response")
          );

          let updatedPages = old.pages.map((page) => {
            if (page === old.pages[0]) {
              let updateMessages;

              if (!isAiResponseCreated) {
                updateMessages = [
                  {
                    createdAt: new Date().toISOString(),
                    id: "ai-response",
                    text: accResponse,
                    isUserMessage: false,
                  },
                  ...page.messages,
                ];
              } else {
                updateMessages = page.messages.map((message) => {
                  if (message.id === "ai-response") {
                    return {
                      ...message,
                      text: accResponse,
                    };
                  }
                  return message;
                });
              }
              return {
                ...page,
                messages: updateMessages,
              };
            }
            return page;
          });
          return {
            ...old,
            pages: updatedPages,
          };
        });
      }
    },

    onError: (__, _, context) => {
      setMessage(backupMessage.current);
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessage ?? [] }
      );
    },

    onSettled: async () => {
      setIsLoading(false);
      //data is no londer upto data so it refetches the data
      await utils.getFileMessages.invalidate({ fileId });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const addMessage = () => sendMessage({ message });

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
