import React, { useState, useEffect, useRef } from 'react';
import { createChatSession } from '../services/geminiService';
import type { Chat } from '@google/genai';
import Spinner from './common/Spinner';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

const ChatContainer: React.FC = () => {
    return (
        <div className="h-full flex flex-col bg-base-100 rounded-lg border border-base-300">
            <div className="flex-grow overflow-hidden">
                <GeminiChatInterface />
            </div>
        </div>
    );
};

const GeminiChatInterface: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            setChat(createChatSession());
        } catch (err: any) {
            setError(err.message);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const result = await chat.sendMessage({ message: input });
            const modelMessage: ChatMessage = { role: 'model', text: result.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-base-200 text-text-primary'}`}>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-xl p-3 rounded-lg bg-base-200 text-text-primary">
                            <Spinner />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex-shrink-0 p-4 border-t border-base-300">
                 {error && <p className="text-red-400 text-sm mb-2 text-center">{error}</p>}
                <div className="flex items-center gap-4 bg-base-200 rounded-lg p-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập tin nhắn..."
                        className="w-full flex-grow p-2 bg-transparent focus:outline-none text-text-primary resize-none"
                        rows={1}
                        style={{ maxHeight: '100px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="p-2 bg-primary text-white rounded-full hover:bg-indigo-700 disabled:bg-base-300 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatContainer;