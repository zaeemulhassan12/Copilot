"use client";
import { useState, useEffect } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('llama3.2:3b');

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('http://localhost:8000/models');
        const data = await response.json();
        if (data.models) {
          setModels(data.models);
          if (data.models.length > 0) {
            setSelectedModel(data.models[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load models", e);
      }
    }
    fetchModels();
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, model: selectedModel }),
      });

      if (!response.ok) throw new Error('Failed to connect to backend');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Error: Could not connect to the AI backend. Make sure it is running!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <main className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto w-full flex flex-col h-full bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <div className="font-bold text-xl">AI Copilot Chat 🤖</div>
          <div className="flex gap-2 items-center">
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-black text-sm p-1 rounded border"
            >
              {models.map(m => <option key={m} value={m}>{m}</option>)}
              {models.length === 0 && <option value="llama3.2:3b">Default Model</option>}
            </select>
            <button 
              onClick={clearChat}
              className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 mt-10">Select a model and ask me anything!</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && <div className="text-left text-gray-400 italic text-sm">AI is thinking...</div>}
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
          <input
            className="flex-1 p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button 
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
