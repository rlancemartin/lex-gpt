import pinecone
import os
import time
from pathlib import Path
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import PyPDFLoader
from langchain.document_loaders import TextLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Pinecone
from tqdm import tqdm


dir = Path('../custom/data/Merged')
paths = [p for p in dir.glob('**/*.pdf')]
# random sample 500 pdf files under dir
import random
paths = random.sample(paths, 10)
loaders = [(p, PyPDFLoader(str(p))) for p in paths]
documents = []
for path, loader in tqdm(loaders):
    try:
        doc = loader.load()
    except:
        print(f"Error loading {path}")
        continue
    for d in doc:
        d.metadata['id'] = path.stem
        d.metadata['flno'] = path.stem
        d.metadata['title'] = path.stem
        d.metadata['link'] = "https://d8ai.com/"
        d.metadata['category'] = path.parts[4]
    documents.extend(doc)

text_splitter = CharacterTextSplitter.from_tiktoken_encoder(chunk_size=2000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

# print how many documents we have
print(f"Number of documents: {len(texts)}")

embeddings = OpenAIEmbeddings()

# initialize pinecone
pinecone.init(
    api_key=os.environ["PINECONE_API_KEY"],  # set in .env
    environment="us-west4-gcp",  # next to api key in console
)

index_name = "custom"
index = pinecone.Index(index_name)

create_new = False
# Delete vectors if it already exists
if create_new:
    try:
        print("Deleting index")
        pinecone.delete_index(index_name)
        print("Deleted index")
    except pinecone.exceptions.PineconeException as e:
        print("Index does not exist")
        print(e)
        pass

    print("Creating index")
    docsearch = Pinecone.from_documents(texts, embeddings, index_name=index_name)
    print("Created index")
else:
    docsearch = Pinecone(index, embeddings.embed_query, "text")

query = "誰是扣繳義務人？"
# time the query
start = time.time()
docs = docsearch.similarity_search(query)
end = time.time()
print(f"Query time: {end - start}")

# print(docs)

system_template = """使用以下法規片段來回答用戶的問題。如果您不知道答案，只需說不知道即可，不要試圖編造答案。將您的答案保持在五句以下。答案要是繁體中文、要準確、有幫助、簡明明確。使用以下段落來回答查詢
----------------
{context}"""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

chain_type_kwargs = {"prompt": prompt}
qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(),
    chain_type="stuff",
    retriever=docsearch.as_retriever(),
    chain_type_kwargs=chain_type_kwargs,
)

print("-" * 80)
print(f"Query: {query}")
# time the query
start = time.time()
print(qa.run(query))
end = time.time()
print(f"Query time: {end - start}")
