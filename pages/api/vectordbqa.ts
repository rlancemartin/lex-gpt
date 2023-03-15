import { PineconeStore } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeClient } from "@pinecone-database/pinecone";
import { VectorDBQAChain } from "langchain/chains";
import { OpenAIChat } from "langchain/llms";
import { CallbackManager } from "langchain/callbacks";
import { NextApiRequest, NextApiResponse } from "next";

type Data = {};
const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
try {
    
      // Inputs 
      const prompt = req.body.prompt;
      const apiKey = req.body.apiKey;
      process.env.OPENAI_API_KEY = apiKey;

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

      // Handling repeat questions
      const Cache = require('./cache');
      let answerText = '';

      // Call LLM and stream output
      const model = new OpenAIChat({ temperature: 0.0, 
        streaming: true, 
        callbackManager: CallbackManager.fromHandlers( {  
         async handleLLMNewToken(token) {  
          answerText += token.replace(/["'\n\r]/g, '');
          if (!Cache.get(prompt))   {
            res.status(200).write(token.replace(/["'\n\r]/g, '')); 
          }
        },
      } ),
      });
      const chain = VectorDBQAChain.fromLLM(model, vectorStore);
      chain.returnSourceDocuments=false;
      chain.k=4;
      const responseBody = await chain.call({query: prompt,});

      if (Cache.get(prompt)) {
        res.status(200).send(Cache.get(prompt)); 
      } else {
        Cache.set(prompt, answerText);
        res.end();
      }
      
  } catch (error) {
    console.error(error);
    res.status(500).json("Error");
  }
};

export default handler;