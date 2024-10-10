"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, Send, AlertTriangle, Book, Brain, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playfairDisplay } from './fonts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Define Message type
type Message = { text: string; sender: 'user' | 'ai' };

const depthIcons = {
  Casual: Lightbulb,
  Thoughtful: Book,
  Deep: Brain,
  Socratic: Brain
};

const sensitiveTopics = [
  'suicide',
  'self-harm',
  'depression',
  'anxiety',
  'abuse',
  'violence',
  'eating disorder',
];

const helpResources = [
  { name: "National Suicide Prevention Lifeline", phone: "1-800-273-8255" },
  { name: "Crisis Text Line", text: "HOME to 741741" },
  { name: "National Domestic Violence Hotline", phone: "1-800-799-7233" },
  { name: "SAMHSA's National Helpline", phone: "1-800-662-4357" },
];

export default function DisputareUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [depth, setDepth] = useState('Casual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isInitialInput, setIsInitialInput] = useState(true);
  const [isDepthOpen, setIsDepthOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prevTime => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Function to check for sensitive topics
  const checkSensitiveTopics = (text: string) => {
    return sensitiveTopics.some(topic => text.toLowerCase().includes(topic));
  };

  // Function to send input to OpenAI API and get a response
  const getAIResponse = async (inputText: string) => {
    const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      return "Error: OpenAI API key is missing.";
    }

    if (checkSensitiveTopics(inputText)) {
      return `I've detected that you might be discussing a sensitive topic. While I'm not equipped to provide professional help, here are some resources that might be helpful:

• ${helpResources.map(resource => `${resource.name}: ${resource.phone || resource.text}`).join('\n• ')}

Remember, it's important to seek help from qualified professionals for serious concerns. Your well-being is important.`;
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {role: "system", content: `You are an AI that plays devil's advocate. Your job is to challenge the user's opinion in a thoughtful way, not for the sake of arguing but to help the user learn if their opinions are truly theirs. Present your responses in bullet points for easier readability. Avoid harmful or dangerous content. Current depth: ${depth}.`},
            {role: "user", content: inputText}
          ],
          max_tokens: 250,
          temperature: 0.7
        })
      });

      const data = await response.json();

      if (data?.choices && data.choices.length > 0) {
        return data.choices[0].message.content.trim();
      } else {
        throw new Error("No response from API");
      }
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return "Sorry, I couldn't generate a response. Please try again.";
    }
  };

  const handleSend = async () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      setIsGenerating(true);
      if (isInitialInput) {
        setIsInitialInput(false);
      }

      const aiResponse = await getAIResponse(input);

      setMessages(prev => [...prev, { text: aiResponse, sender: 'ai' }]);
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#1A1B26] to-[#24283B] text-[#A9B1D6]">
      {/* Header */}
      <motion.header 
        className="bg-[#24283B]/50 backdrop-blur-md shadow-lg p-6 flex justify-between items-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div 
          className="text-sm text-[#7AA2F7]"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          Session Time: {formatTime(sessionTime)}
        </motion.div>
        <motion.h1 
          className={`${playfairDisplay.className} text-4xl text-center flex-1 text-[#BB9AF7] font-bold`}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          Disputare
        </motion.h1>
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <button
            onClick={() => setIsDepthOpen(!isDepthOpen)}
            className="appearance-none bg-[#1A1B26]/50 text-[#A9B1D6] border border-[#414868] rounded-full px-4 py-2 pr-8 leading-tight focus:outline-none focus:border-[#7AA2F7] transition-all duration-200 ease-in-out hover:bg-[#1A1B26]/70"
          >
            {depth}
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#7AA2F7]" size={20} />
          </button>
          {isDepthOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#1A1B26] ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {['Casual', 'Thoughtful', 'Deep', 'Socratic'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setDepth(option);
                      setIsDepthOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-[#A9B1D6] hover:bg-[#24283B] w-full text-left"
                    role="menuitem"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl p-4 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-[#7AA2F7] to-[#BB9AF7] text-[#1A1B26]'
                    : 'bg-[#24283B]/70 backdrop-blur-sm text-[#A9B1D6]'
                }`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {message.sender === 'ai' && (
                  <div className="flex items-center mb-2">
                    {React.createElement(depthIcons[depth as keyof typeof depthIcons], { size: 16, className: 'mr-2 text-[#BB9AF7]' })}
                    <span className="text-xs text-[#7AA2F7]">AI Assistant</span>
                  </div>
                )}
                <div dangerouslySetInnerHTML={{ __html: message.text.replace(/•/g, '<br>•') }} />
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isGenerating && (
          <div className="flex justify-start">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop"
              }}
              className="bg-[#24283B]/70 backdrop-blur-sm rounded-full p-2 inline-flex space-x-1"
            >
              <div className="w-2 h-2 bg-[#7AA2F7] rounded-full"></div>
              <div className="w-2 h-2 bg-[#BB9AF7] rounded-full"></div>
              <div className="w-2 h-2 bg-[#7AA2F7] rounded-full"></div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <motion.div 
        className={`p-6 ${isInitialInput ? 'absolute inset-x-0 top-1/2 transform -translate-y-1/2' : ''}`}
        initial={false}
        animate={isInitialInput ? { y: "-50%" } : { y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="relative max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isInitialInput ? "Tell me your opinion..." : "Share your thoughts..."}
              className="w-full p-4 pr-12 rounded-full border border-[#414868] bg-[#1A1B26]/70 backdrop-blur-md text-[#A9B1D6] placeholder-[#565F89] focus:ring-2 focus:ring-[#7AA2F7] focus:border-transparent focus:outline-none transition-all duration-200 ease-in-out"
            />
            <button
              onClick={handleSend}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#7AA2F7] hover:text-[#BB9AF7] transition-all duration-200 ease-in-out"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Disclaimer Dialog */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disclaimer</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-[#A9B1D6]">
              Welcome to Disputare, an AI-powered discussion platform. Please read this disclaimer carefully:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#A9B1D6]">
              <li>Disputare is designed for intellectual discourse and is not a substitute for professional advice.</li>
              <li>The AI's responses are generated based on patterns in data and may not always be accurate or appropriate.</li>
              <li>For sensitive topics or personal issues, please seek help from qualified professionals.</li>
              <li>We prioritize user safety and have implemented filters for potentially harmful content.</li>
              <li>Your privacy is important. Do not share personal or sensitive information.</li>
              <li>The opinions expressed by the AI do not necessarily reflect the views of the creators.</li>
              <li>Use this platform responsibly and respectfully.</li>
            </ul>
            <p className="mt-4 text-[#7AA2F7]">
              By continuing to use Disputare, you acknowledge that you have read and understood this disclaimer.
            </p>
          </div>
          <Button onClick={() => setShowDisclaimer(false)}>
            I Understand
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}