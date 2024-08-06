import { db } from "@/db";
import getSession from "@/lib/getSession";
import { pinecone } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validator/SendMessageValidator";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const session = await getSession();
    const user = session?.user;

    if (!user) return new Response("Unauthorized", { status: 401 });

    const { fileId, message } = SendMessageValidator.parse(body);

    const file = await db.file.findFirst({
      where: {
        id: fileId,
        userId: user.id,
      },
    });

    if (!file) return new Response("Not Found", { status: 404 });

    await db.message.create({
      data: {
        text: message,
        isUserMessage: true,
        userId: user.id,
        fileId: fileId,
      },
    });

    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const embedModel = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });
    const chatModel = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Embed user message
    const embedResult = await embedModel.embedContent(message);
    const embedding = embedResult.embedding.values;

    // Initialize Pinecone index
    const pineconeIndex = pinecone.Index("chatpdf");

    // Perform similarity search
    const queryResponse = await pineconeIndex.namespace(fileId).query({
      vector: embedding,
      topK: 4,
      includeMetadata: true,
    });

    // Extract relevant information from the query response
    const similarVectors = queryResponse.matches.map((match) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata ?? {},
      text: match.metadata?.text ?? "",
      pageNumber: match.metadata?.pageNumber ?? null,
    }));

    const context = similarVectors.map((v) => v.text).join("\n\n");

    // Retrieve previous messages
    const prevMessages = await db.message.findMany({
      where: {
        fileId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });

    const formattedPrevMessages = prevMessages
      .reverse()
      .map((msg) => `${msg.isUserMessage ? "User" : "Assistant"}: ${msg.text}`)
      .join("\n");

    const prompt = `
    Previous Conversation:
    ${formattedPrevMessages}
    
    Context from PDF:
    ${context}
    
    User Question: ${message}
    
    Please provide a concise and accurate answer to the user's question based on the given context and previous conversation. If the information provided isn't sufficient to answer the question, please state that you don't have enough information to provide an accurate answer.
    `;

    // Generate streaming response using Gemini
    const response = await chatModel.generateContentStream({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.1,
      },
    });

    // Create a ReadableStream from the Google AI stream
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";
        for await (const chunk of response.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();

        // Save the full response to the database
        await db.message.create({
          data: {
            text: fullResponse,
            isUserMessage: false,
            userId: user.id,
            fileId: fileId,
          },
        });
      },
    });

    // Return the streaming response
    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Error in PDF chat API:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
