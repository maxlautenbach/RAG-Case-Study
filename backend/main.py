from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os
from langchain_community.document_loaders import JSONLoader, PyPDFLoader
from io import BytesIO
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import BaseModel
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from langchain_ollama import OllamaEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_community.document_loaders import UnstructuredHTMLLoader, Docx2txtLoader, UnstructuredMarkdownLoader
from tqdm import tqdm


load_dotenv()
app = FastAPI(title="RAG API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create upload directory if it doesn't exist
UPLOAD_DIR = Path("/Users/maxlautenbach/Documents/GitHub/RAG-Case-Study/data/upload")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

embeddings = OllamaEmbeddings(
    model=os.getenv("EMBEDDING_MODEL_ID"),
)

chat_model = ChatOpenAI(
    api_key=os.getenv("API_KEY"),
    base_url=os.getenv("BASE_URL"),
    model=os.getenv("LLM_MODEL_ID"),
)

qdrant_client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
)

if not qdrant_client.collection_exists("bund_collection"):
    qdrant_client.create_collection("bund_collection",              vectors_config=VectorParams(size=1024, distance=Distance.COSINE))

vector_store = QdrantVectorStore(
    client=qdrant_client,
    collection_name="bund_collection",
    embedding=embeddings,
)

retriever = vector_store.as_retriever(search_kwargs={"k": 20})


@app.post("/upload")
async def data_upload(files: List[UploadFile] = File(...)):
    """
    Upload one or more files to the server.
    """
    try:
        documents = []
        text_splitter = RecursiveCharacterTextSplitter(
            # Set a really small chunk size, just to show.
            chunk_size=512,
            chunk_overlap=50,
            length_function=len,
            is_separator_regex=False,
        )
        for file in tqdm(files):
            print(file.filename)
            # Save file to upload directory
            file_path = UPLOAD_DIR / file.filename
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            # Extract file extension
            file_extension = os.path.splitext(file.filename)[1].lower()
            
            # Handle JSON files
            if file_extension == '.json':
                # Load JSON using JSONLoader with the saved file path
                loader = JSONLoader(
                    file_path=str(file_path),
                    jq_schema='.',
                    text_content=False
                )
                
                # Load the documents
                documents += loader.load_and_split(text_splitter)
            elif file_extension == '.pdf':
                loader = PyPDFLoader(file_path)
                documents += loader.load_and_split(text_splitter)
            elif file_extension == '.html':
                loader = UnstructuredHTMLLoader(file_path)
                documents += loader.load_and_split(text_splitter)
            elif file_extension == '.docx' or file_extension == ".doc":
                loader = Docx2txtLoader(file_path)
                documents += loader.load_and_split(text_splitter)
            elif file_extension == '.md':
                loader = UnstructuredMarkdownLoader(file_path)
                documents += loader.load_and_split(text_splitter)
        vector_store.add_documents(documents)
        return {"message": f"Successfully uploaded {len(files)} file(s) in {len(documents)} chunks to the vector store"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


class RAGRequest(BaseModel):
    user_query: str

@app.post("/rag")
async def invoke_rag(request: RAGRequest):
    """
    Process a query using RAG (Retrieval Augmented Generation).
    """
    try:
        prompt = PromptTemplate.from_template("""
            You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you can't retrieve the answer from the context and you also don't know the answer for sure, just say that you don't know. Use three sentences maximum and keep the answer concise. Please answer in the language of the question.
            Question: {question} 
            Context: {context} 
            Answer:
            """)
        print(retriever.invoke(request.user_query))
        rag_chain = {"context": retriever, "question": RunnablePassthrough()} | prompt | chat_model | StrOutputParser()
        response = rag_chain.invoke(request.user_query)
        return {
            "response": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clear")
async def clear():
    """
    Clear uploaded files and Qdrant collection.
    """
    try:
        # Clear files from UPLOAD_DIR
        for file in UPLOAD_DIR.glob('*'):
            if file.is_file():
                file.unlink()
        
        # Delete collection if exists
        qdrant_client.delete_collection("bund_collection")
        
        # Recreate empty collection
        qdrant_client.create_collection(
            collection_name="bund_collection",
            vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
        )
        
        return {"message": "Successfully cleared files and Qdrant collection"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
