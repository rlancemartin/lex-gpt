import { PineconeStore } from "langchain/vectorstores/pinecone"
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { VectorDBQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { CallbackManager } from "langchain/callbacks";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge"
};
export default async function handler(req: NextRequest)
{ 

      // Inputs 
      const { prompt } = (await req.json()) as { prompt: string; };

      // Vector DB
      const pinecone = new PineconeClient();
      await pinecone.init({
        environment: "us-east1-gcp", 
        apiKey: process.env.PINECONE_API_KEY ?? "",
      });

      const index = pinecone.Index("lex-gpt");
      const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings(), {pineconeIndex: index},
      );

      // Call LLM and stream output
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();
      const llm = new ChatOpenAI({
        temperature: 0.0,
        streaming: true,
        callbackManager: CallbackManager.fromHandlers({
          handleLLMNewToken: async (token) => {
            await writer.ready;
            await writer.write(encoder.encode(`data: ${token.replace(/["'\n\r]/g,'')}\n\n`));
          },
          handleLLMEnd: async () => {
            await writer.ready;
            await writer.close();
          },
          handleLLMError: async (e) => {
            await writer.ready;
            await writer.abort(e);
          },
        }),
      });

      const chain = VectorDBQAChain.fromLLM(llm, vectorStore);
      chain.returnSourceDocuments=false;
      chain.k=4;

      chain.call({
        query: prompt,
      }).catch(console.error);

      return new NextResponse(stream.readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
  }