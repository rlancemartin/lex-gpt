import { PineconeStore } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeClient } from "@pinecone-database/pinecone";
import { VectorDBQAChain } from "langchain/chains";
import { OpenAIChat } from "langchain/llms";
import { NextApiRequest, NextApiResponse } from "next";

type Data = {};
const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  // try {
    
      // Inputs 
      const prompt = req.body.prompt;
      const apiKey = req.body.apiKey;
      process.env.OPENAI_API_KEY = apiKey;

      // Vector DB call
      const pinecone = new PineconeClient();
      await pinecone.init({
        environment: "us-east1-gcp", 
        apiKey: process.env.PINECONE_API_KEY ?? "",
      });
      const index = pinecone.Index("lex-test");
      const vectorStore = await PineconeStore.fromExistingIndex(
        index,
        new OpenAIEmbeddings()
      );
       
      // Call LLM 
      const model = new OpenAIChat({ temperature: 0.0, 
                                     streaming: true, 
                                     callbackManager: {  
                                 handleNewToken(token) {  
                        // 1/ Text streams, as expected 
                        console.log(token);
                        // 2/ I want to write text to the response 
                        // res.write(token.replace(/["'\n\r]/g, '')); 
                        // 3/ But I also want to set headers w/ source documents (below)
                        // 4/ I don't have access to source docs here (the token is a sting)
                        // 5/ I later can't update header b/c text is already sent to client"  
        },
        }});
      const chain = VectorDBQAChain.fromLLM(model, vectorStore);
      chain.returnSourceDocuments=true;
      chain.k=7;
      const responseBody = await chain.call({query: prompt,});

      // Update response headers w/ source documents 
      type Headers = { [key: string]: string; };
      const headers: Headers = { "sourceDocuments": JSON.stringify(responseBody["sourceDocuments"]) };
      Object.keys(headers).forEach(key => {res.setHeader(key, headers[key]);}); 

      // Clean up response text
      let answerText = responseBody["text"]; 
      answerText = answerText.replace(/["'\n\r]/g, ''); 
      
      // Return
      res.status(200).send(answerText); 
      
  //} catch (error) {
  //  console.error(error);
  //  res.status(500).json("Error");
  //}
};

export default handler;