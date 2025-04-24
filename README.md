# RAG Case Study

## Project Structure

The project is structured in a frontend and backend within their corresponding folders `\frontend` and `\backend`. In addition, this project holds a `\data` folder to store uploaded data locally.

### Backend

The backend provides a REST API implemented in Python 3.11 using the FastAPI and various Langchain packages. The folder also includes example REST requests, that can be imported in [Insomnia](https://insomnia.rest/).

### Frontend

The frontend is implemented using [Next.js 15](https://nextjs.org/) and the app router. It serves an UI for chatting with the RAG Backend and managing documents

## Used Technology

- Backend using Python 3.11
  - FastAPI
  - Langchain
  - Ollama
- Frontend using Next.js 15
  - React
  - Tailwind CSS
- Infrastructure using Docker
  - Qdrant

## Project Setup

### Requirements

- Python (tested on 3.11)
- node.js (tested on v23.7.0)
- Docker Engine

### Setup Steps

1. Run `docker compose up -d` to start the Qdrant vector store
2. [Create a virtual python environment](https://docs.python.org/3/library/venv.html), activate it and run `pip install -r ./backend/requirements.txt` to install all required packages for the backend.
3. Run `cd frontend && npm install` to install all required packages for the frontend.
4. Configure a `.env` file in the backend folder including

```
EMBEDDING_MODEL_ID=<ID of the Embedding, which should be used>
LLM_MODEL_ID=<ID of the LLM, which should be used>
BASE_URL=<Base URL of OpenAI Compatible Endpoint>
API_KEY=<API Key of OpenAI Compatible Endpoint>
QDRANT_URL=<URL of the Vector DB>
```

4. Go back to the root folder and start the FastAPI server by executing `python ./backend/main.py` using your virtual environment.
5. Start the frontend by using `cd ./frontend && npm run build && npm run start`.
6. Open `localhost:3000` to access the UI.
7. Click on `Clear Vector DB` to initialize the Vector DB.

## Prepared Questions

In order to test the RAG-Chain with a small subset of documents and questions, you can upload the five files included in the data folder via the UI. Afterwards you can test the chatbot using the following questions:

- Welche Personen spricht Olaf Scholz in seinem Grußwort zum 125-jährigen DFB Jubiläum direkt an?
- Was ist der Titel des neuen Koalitionsvertrags?
- Wie soll ein elektronischer Impfpass ausgestaltet werden?
- Wie viele Bundesländer hat Deutschland?
- Wer gehört dem Bundeskabinett aktuell noch an?
