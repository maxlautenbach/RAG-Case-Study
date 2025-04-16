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

1. Run `docker-compose up` to start the Qdrant vector store
2. [Create a virtual python environment](https://docs.python.org/3/library/venv.html), activate it and run `pip install -r ./backend/requirements.txt` to install all required packages for the backend.
3. Run `cd frontend && npm install` to install all required packages for the frontend.
4. Configure a `.env` file in the backend folder including

```
EMBEDDING_MODEL_ID=
LLM_MODEL_ID=
BASE_URL=<Base URL of OpenAI Compatible Endpoint>
API_KEY=<API Key of OpenAI Compatible Endpoint>
QDRANT_URL=
```

4. Start the FastAPI server by executing the `/backend/main.py` using your virtual environment.
5. Start the frontend by using `npm run build && npm run start`

## Prepared Questions

In order to test the RAG-Chain with a small subset of documents and questions, you can upload the five files included in the data folder via the UI. Afterwards you can test the chatbot using the following questions:

- Wie soll ein elektronischer Impfpass ausgestaltet werden?
- Was ist der Titel des neuen Koalitionsvertrags?
- Welche Personen spricht Olaf Scholz in seiner Rede zum 125-jährigen DFB Jubiläum direkt an?
- Wer gehört dem Bundeskabinett aktuell noch an?
- Wie viele Bundesländer hat Deutschland?
