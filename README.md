# Lex GPT

This app enables AI-powered search for Lex Fridman podcast.

This is also a testbed for exploring Langchain functionality. 

## Dataset
 
Scrape ep 1-325 Whisper transcriptions via @karpathy for first 325 episodes:
 
https://karpathy.ai/lexicap/index.html

Trascribe remaining episodes (through episode 365) with Whisper.
 
Transcribed data is split / embedded (Pinecone) with Langchain.

All steps outlined in: `scripts/get_data.ipynb`

## Search

Use Langchain `VectorDBQAChain` to: 
* Embed the user query
* Perform similarity search on Pinecone embeddings
* Synthesize the answer from relevant chunks with `GPT 3.5`

## Search

Relevant chunks with metadata (links) are displayed as source documents.
 
This builds on the excellent UI from https://github.com/mckaywrigley/wait-but-why-gpt.

## Deploy

Note: the app that supports streaming is deployed to fly.io: https://lex-gpt.fly.dev/

This is because Vercel requires edge functions for streaming.

We are working on getting edge functions working with Langchain.

In the meantime, use https://lex-gpt.fly.dev/ for the more performant app. 

## Credits

Thanks to [Mckay Wrigley](https://twitter.com/mckaywrigley) for open-sourcing his UI.
 
Thanks to Lex Fridman for the excellent podcast.

Thanks to Karapthy for the Whisper transcriptions.

## Contact

If you have any questions, feel free to reach out to me on [Twitter](https://twitter.com/RLanceMartin)!
