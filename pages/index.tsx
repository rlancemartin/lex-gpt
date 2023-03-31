import { Answer } from "@/components/Answer/Answer";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { LEXChunk } from "@/types";
import { IconArrowRight, IconExternalLink, IconSearch } from "@tabler/icons-react";
import Head from "next/head";
import Image from "next/image";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { fetchEventSource } from '@microsoft/fetch-event-source';

export default function Home() {

  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string>("");
  const [chunks, setChunks] = useState<LEXChunk[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);  
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Handle answer 
  const handleAnswer = async () => {
    
    if (!query) {
      alert("Please enter a query.");
      return;
    }
    
    setAnswer("");
    setChunks([]);
    setLoading(true);
    
    // Similarity search for relevant chunks 
    const search_results = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
     });

     if (!search_results.ok) {
      setLoading(false);
      throw new Error(search_results.statusText);
    }
    const results: LEXChunk[] = await search_results.json();
    setChunks(results);

    // Prompt for LLM summarization
    const prompt = `You are a helpful assistant that accurately answers queries using Lex Fridman podcast episodes. Use the text provided to form your answer, but avoid copying word-for-word from the posts. Try to use your own words when possible. Keep your answer under 5 sentences. Be accurate, helpful, concise, and clear. Use the following passages to provide an answer to the query: "${query}"`
    const ctrl = new AbortController();
    
    fetchEventSource("/api/vectordbqa",  {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({  prompt }),
      onmessage: (event) => { 
        setLoading(false);
        const data = JSON.parse(event.data);
        if (data.data === "DONE") {
          // Complete 
        } else {
          // Stream text
          setAnswer((prev) => prev + data.data);
        }
      }});
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
        handleAnswer();
      }
  };
  
  // Render page
  return (
    <>
      <Head>
        <title>Lex GPT</title>
        <meta
          name="description"
          content={`AI-powered search and chat for the Lex Fridman podcast. `}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="icon"
          href="/favicon.jpeg"
        />
      </Head>

      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex-1 overflow-auto">
          <div className="mx-auto flex h-full w-full max-w-[750px] flex-col items-center px-3 pt-4 sm:pt-8">
            { (
              <div className="relative w-full mt-4">
                <IconSearch className="absolute top-3 w-10 left-1 h-6 rounded-full opacity-50 sm:left-3 sm:top-4 sm:h-8" />
                <input
                  ref={inputRef}
                  className="h-12 w-full rounded-full border border-zinc-600 pr-12 pl-11 focus:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800 sm:h-16 sm:py-2 sm:pr-16 sm:pl-16 sm:text-lg"
                  type="text"
                  placeholder="What is the path to AGI?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            ) }
            {loading ? (
              <div className="mt-6 w-full">

                <div className="font-bold text-2xl mt-6">Passages</div>
                <div className="animate-pulse mt-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                </div>
              </div>
            ) : answer ? (
              <div className="mt-6">
                <div className="font-bold text-2xl mb-2">Answer</div>
                <Answer text={answer} />

                <div className="mt-6 mb-16">
                  <div className="font-bold text-2xl">Passages</div>

                  {chunks.map((chunk, index) => (
                    <div key={index}>
                      <div className="mt-4 border border-zinc-600 rounded-lg p-4">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <Image
                              className="rounded-lg"
                              src={"/"+chunk.metadata.id+".jpg"}
                              width={103}
                              height={70}
                              alt={chunk.metadata.title}
                            />
                            <div className="ml-4">
                              <div className="font-bold text-xl">{chunk.metadata.title}</div>
                            </div>
                          </div>
                          <a
                            className="hover:opacity-50 ml-4"
                            href={chunk.metadata.link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <IconExternalLink />
                          </a>
                        </div>
                        <div className="mt-4">{chunk.pageContent}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : chunks.length > 0 ? (
              <div className="mt-6 pb-16">
                <div className="font-bold text-2xl">Passages</div>
                {chunks.map((chunk, index) => (
                  <div key={index}>
                    <div className="mt-4 border border-zinc-600 rounded-lg p-4">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <Image
                            className="rounded-lg"
                            src={"/"+chunk.metadata.id+".jpg"}
                            width={103}
                            height={70}
                            alt={chunk.metadata.title}
                          />
                          <div className="ml-4">
                            <div className="font-bold text-xl">{chunk.metadata.title}</div>
                          </div>
                        </div>
                        <a
                          className="hover:opacity-50 ml-2"
                          href={chunk.metadata.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <IconExternalLink />
                        </a>
                      </div>
                      <div className="mt-4">{chunk.pageContent}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 text-center text-lg">{`AI-powered search and chat for the Lex Fridman podcast.`}</div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
