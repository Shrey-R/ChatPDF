// import { db } from "@/db";
// import getSession from "@/lib/getSession";
// import { pinecone } from "@/lib/pinecone";
// import { SendMessageValidator } from "@/lib/validator/SendMessageValidator";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { TRPCError } from "@trpc/server";
// import { NextRequest, NextResponse } from "next/server";

// export const POST = async (req: NextRequest) => {
//   //endpoint for asking question to a pdf
//   const body = await req.json();

//   const session = await getSession();
//   const user = session?.user;

//   if (!user) return new NextResponse("Unauthorized", { status: 401 });

//   const { fileId, message } = SendMessageValidator.parse(body);

//   const file = await db.file.findFirst({
//     where: {
//       id: fileId,
//       userId: user.id,
//     },
//   });

//   if (!file) return new NextResponse("Not Found", { status: 404 });

//   await db.message.create({
//     data: {
//       text: message,
//       isUserMessage: true,
//       userId: user.id,
//       fileId: fileId,
//     },
//   });

//   //Embed the user question
//   //search for most relevent PDF page acc to cosine similarity from user que vector
//   //retrive the recent 6 msg of user from DB
//   //combine the related pdf page and user last 6 msg to make prompt
//   //send the promt to the LLM
//   //get the text from LLM
//   //show it to user

//   //1) Embed user text
//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
//   const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

//   // Embed user message
//   const result = await model.embedContent("message");
//   const embedding = result.embedding.values;

//   // Initialize Pinecone index
//   const pineconeIndex = pinecone.Index("chatpdf");

//   async function getSimilarVectors(
//     userMessage: string,
//     fileId: string,
//     topK = 4
//   ) {
//     // Perform similarity search
//     const queryResponse = await pineconeIndex.namespace(fileId).query({
//       vector: embedding,
//       topK: topK,
//       includeMetadata: true,
//     });

//     // Extract relevant information from the query response
//     return queryResponse.matches.map((match) => ({
//       id: match.id,
//       score: match.score,
//       metadata: match.metadata ?? {},
//       text: match.metadata?.text ?? "",
//       pageNumber: match.metadata?.pageNumber ?? null,
//     }));
//   }

//   const prevMessages = await db.message.findMany({
//     where: {
//       fileId,
//     },
//     orderBy: {
//       createdAt: "asc",
//     },
//     take: 6,
//   });

//   const formattedPrevMessages = prevMessages
//     .map((msg) => `${msg.isUserMessage ? "User" : "Assistant"}: ${msg.text}`)
//     .join("\n");

//     const prompt = `
//     Previous Conversation:
//     ${formattedPrevMessages}
    
//     Context from PDF:
//     ${context}
    
//     User Question: ${userMessage}
    
//     Please provide a concise and accurate answer to the user's question based on the given context and previous conversation. If the information provided isn't sufficient to answer the question, please state that you don't have enough information to provide an accurate answer.
//     `;
// };

