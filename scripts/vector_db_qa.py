import pinecone
import os
import time
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import TextLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma, Pinecone

loader = TextLoader("busines_tax_split.txt")
documents = loader.load()

text_splitter = CharacterTextSplitter(chunk_size=200, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

# add meta data
# metadata: {"source":title + " " +link,"id":episode_id,"link":link,"title":title}
for i, doc in enumerate(texts):
    title = doc.page_content.splitlines()[0].strip()
    flno = title[1:-1].strip()
    if "章" in title:
        link = "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0340080"
    else:
        link = f"https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0340080&flno={flno}",
    doc.metadata = {
            "source": "法規資料庫-加值型及非加值型營業稅法",
            "id": i,
            "flno": flno,
            "title": title,
            "link": link,
        }

# print how many documents we have
print(f"Number of documents: {len(texts)}")

embeddings = OpenAIEmbeddings()

# initialize pinecone
pinecone.init(
    api_key=os.environ["PINECONE_API_KEY"],  # set in .env
    environment="us-west4-gcp",  # next to api key in console
)

index = pinecone.Index("tax-gpt")

index_name = "tax-gpt"

create_new = True
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
