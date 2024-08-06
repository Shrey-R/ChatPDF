import { db } from "@/db";
import getSession from "@/lib/getSession";
import { CompressionStream } from "node:stream/web";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { pinecone } from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const session = await getSession();
      const user = session?.user;
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          // url:`https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          url: file.url,
          uploadStatus: "PROCESSING",
        },
      });

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

      async function getEmbedding(text:any) {
        const result = await model.embedContent(text);
        return result.embedding;
      }

      try {
        const response = await fetch(file.url);
        const blob = await response.blob();

        //loading and parsing the pdf from local storage
        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();
        const pageAmt = pageLevelDocs.length;

        //vectorize and index entire document
        const pineconeIndex = pinecone.Index("chatpdf");
        
        //openAI embeddings
        // const embeddings = new OpenAIEmbeddings({
        //   openAIApiKey: process.env.OPENAI_API_KEY,
        // });

        //Google embeddig
        const embeddings = await Promise.all(
          pageLevelDocs.map(doc => getEmbedding(doc.pageContent))
        );

        const vectors = pageLevelDocs.map((doc, i) => {
          const vector = {
            id: `${createFile.id}-${i}`,
            values: embeddings[i].values,
            metadata: {
              text: doc.pageContent,
              pageNumber: doc.metadata.pageNumber,
            },
          };
          return vector;
        });


        //saving vector in pinecode DB
        await pineconeIndex.namespace(createFile.id).upsert(vectors);

        // await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
        //   pineconeIndex,
        //   namespace: createFile.id,
        // });

        //update db File table that pdf has been process and its vector has been stored in pinecode
        //update the uploadstatus to SUCCESS or FAILED
        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createFile.id,
          },
        });
      } catch (error) {
        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: createFile.id,
          },
        });
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
