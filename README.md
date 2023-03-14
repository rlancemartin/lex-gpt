# Lex GPT

AI-powered search for Lex Fridman podcast.

This is a testbed for exploring Langchain functionality. 

## Dataset
 
Start with episode transcriptions from Whisper via @karpathy for first 325 episodes:

https://karpathy.ai/lexicap/index.html

Text splitting and OpenAI embeddings done via Langchain in scripts/get_data.ipynb.

Store embeddings in Pinecone.

### Search

Use Langchain VectorDBQAChain to embed the user query and perform similarity search on Pinecone embeddings. Synthesize the answer from relevant chunks with ChatGPT. The relevant chunks with metadata (links) are displayed as source documents in the UI.

### UI

This build on the excellent: https://github.com/mckaywrigley/wait-but-why-gpt

## Credits

Thanks to [Mckay Wrigley](https://twitter.com/mckaywrigley) for his work on the UI and app design.

Of course, thanks for Lex Fridman for the excellent podcast and Karapthy for the Whisper transcriptions.

## Contact

If you have any questions, feel free to reach out to me on [Twitter](https://twitter.com/mckaywrigley)!
