"use client";

import Image from "next/image";
import { useState } from "react";
import Form from "next/form";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUp } from "react-feather";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  function invoke_rag(data) {
    const query = data.get("query");
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "User", message: query, loading: false },
    ]);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: "AI",
        message: "",
        loading: true,
      },
    ]);
    const url = "http://localhost:8000/rag";
    const body = JSON.stringify({ user_query: query });
    console.log(body);
    fetch(url, {
      method: "POST",
      body: body,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const answer = data["response"];
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          { sender: "AI", message: answer, loading: false },
        ]);
        console.log(messages);
      });
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Find the closest form and submit it
      e.currentTarget.closest("form")?.requestSubmit();
    }
  };

  const handleFileChange = async (event) => {
    setIsUploading(true);
    try {
      const files = [...event.target.files];
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      console.log("Upload successful:", result);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
  };

  const clearVectorDB = async () => {
    try {
      const response = await fetch("http://localhost:8000/clear", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to clear vector database");
      }

      const result = await response.json();
      console.log("Vector database cleared:", result);
    } catch (error) {
      console.error("Error clearing vector database:", error);
    }
  };

  const ChatInput = ({ placeholder }) => {
    return (
      <div className="w-full">
        <Form
          action={invoke_rag}
          className="bg-grey-900 w-full flex items-center rounded-2xl px-6 py-4 max-h-4xl"
        >
          <TextareaAutosize
            name="query"
            className="flex-grow outline-0 resize-none self-center scrollbar-thin scrollbar-thumb-white scrollbar-track-grey-900 mr-2"
            minRows={1}
            maxRows={6}
            placeholder={placeholder}
            onKeyDown={handleKeyPress}
          />
          <button
            type="submit"
            className="bg-white rounded-full p-2 hover:bg-gray-200 transition-all duration-300 active:bg-gray-300"
          >
            <ArrowUp className="w-full h-full stroke-3" color="black" />
          </button>
        </Form>
        <div className="flex py-4 gap-2">
          <input
            type="file"
            id="fileInput"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="fileInput"
            className="bg-white text-black py-2 px-4 rounded-full hover:bg-gray-300 transition-all duration-300 active:bg-gray-500 cursor-pointer"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload File(s)"}
          </label>
          {messages.length > 0 && (
            <button
              onClick={startNewChat}
              className="border border-white py-2 px-4 rounded-full hover:bg-gray-800 transition-all duration-300 active:bg-gray-500"
            >
              Start new Chat
            </button>
          )}
          <button
            onClick={clearVectorDB}
            className="border border-white py-2 px-4 rounded-full hover:bg-gray-800 transition-all duration-300 active:bg-gray-500"
          >
            Clear Vector DB
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center h-screen w-screen bg-linear-to-br from-black via-black via-70% to-lime-900 text-white">
      <header className="flex justify-start items-center w-full p-6">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 relative rounded-xl overflow-hidden">
            <Image
              src="/logo.png"
              alt="logo"
              fill={true}
              className="w-full h-full"
            />
          </div>
          <h2 className="text-2xl font-light">Aleph Alpha | RAG Demo</h2>
        </div>
      </header>
      <div className="w-full h-full flex justify-center items-center px-12">
        {messages.length === 0 ? (
          <div className="w-4xl flex flex-col items-center gap-6">
            <p className="text bg-gradient-to-br from-white to-gray-400 text-transparent bg-clip-text font-bold text-4xl">
              Welcome to the Aleph Alpha RAG Demo
            </p>
            <ChatInput placeholder="Ask any question..." />
          </div>
        ) : (
          <div className="w-4xl h-full flex flex-col pb-6 pt-12">
            <div className="w-full flex-grow overflow-y-scroll scrollbar-thin scrollbar-thumb-white scrollbar-track-black/0 flex flex-col gap-6 px-6">
              {messages.map((message) => {
                return (
                  <div key={uuidv4()} className="w-full">
                    {message.sender === "User" ? (
                      <div className="w-full flex justify-end">
                        <p className="bg-grey-800 py-2 px-4 rounded-full text-justify">
                          {message.message}
                        </p>
                      </div>
                    ) : message.loading ? (
                      <div
                        className={`${"bg-grey-800 rounded-full w-96 h-8 animate-pulse"} text-justify`}
                      />
                    ) : (
                      <ReactMarkdown
                        children={message.message}
                        remarkPlugins={[remarkGfm]}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <ChatInput placeholder="Ask another question..." />
          </div>
        )}
      </div>
    </div>
  );
}
