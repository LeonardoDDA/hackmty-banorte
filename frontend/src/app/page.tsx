'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { CreditSimulator } from '@/components/CreditSimulator';
import { GuidanceCard } from '@/components/GuidanceCard';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  render_ui?: boolean;
  component_name?: string;
  component_props?: any;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: '¡Hola! Soy tu asistente Banorte. Deseas cotizar un crédito? Por favor, proporciona los detalles del crédito que deseas.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentPrompt = input;
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.message,
        render_ui: data.render_ui,
        component_name: data.component_name,
        component_props: data.component_props,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error al conectar con el backend:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Lo siento, ocurrió un error al conectar con el servidor.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderDynamicComponent = (name?: string, props?: any) => {
    switch (name) {
      case 'CreditSimulator':
        return <CreditSimulator {...props} />;
      case 'GuidanceCard':
        return <GuidanceCard {...props} />;
      default:
        return null;
    }
  };

  return (
    <main className="flex flex-col h-screen bg-gray-50 text-gray-900">
      {/* Navbar Banorte */}
      <header className="bg-red-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">BANORTE</h1>
            <p className="text-xs text-red-100">Generative UI Financial Assistant</p>
          </div>
        </div>
      </header>

      {/* Áreas de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-4xl w-full mx-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`p-2 rounded-full text-white ${
                msg.sender === 'user' ? 'bg-gray-700' : 'bg-red-600'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>

            <div className="max-w-[85%] space-y-3">
              {/* Texto del mensaje */}
              {msg.text && (
                <div
                  className={`p-4 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-red-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              )}

              {/* RENDERIZADO DINÁMICO DE GENERATIVE UI */}
              {msg.render_ui && msg.component_name === 'CreditSimulator' && (
                <CreditSimulator {...msg.component_props} />
              )}

              {msg.render_ui && msg.component_name === 'GuidanceCard' && (
                <GuidanceCard {...msg.component_props} />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm italic animate-pulse">
            <Bot className="w-5 h-5 text-red-600" />
            <span>Banorte Agent está pensando...</span>
          </div>
        )}
      </div>

      {/* Input de chat */}
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Escribe tu mensaje (ej. 'Quiero cotizar un crédito auto de 350,000 a 48 meses')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </main>
  );
}