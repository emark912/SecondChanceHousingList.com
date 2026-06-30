import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      text: "Hi! I'm the AI Assistant for Second Chance Housing List. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");

  const quickQuestions = [
    "How does the AI matching work?",
    "What credit score do I need?",
    "How long does it take?",
    "What programs are available?",
  ];

  const botResponses: Record<string, string> = {
    "How does the AI matching work?":
      "Our advanced AI analyzes your rental profile including credit, income, and rental history, then matches you with properties and programs that will likely approve your application. The process takes just minutes!",
    "What credit score do I need?":
      "We work with renters of all credit profiles - from evictions and bankruptcy to low credit scores. Our AI finds programs and landlords specifically designed for second chance housing.",
    "How long does it take?":
      "Most users receive their customized rental list within 2 weeks of submitting their profile. Some have found housing in as little as 8 days!",
    "What programs are available?":
      "We match you with Second Chance Apartments, Corporate Leasing Programs, Private Landlords, and specialized Second Chance Housing Programs in your area.",
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text:
          botResponses[text] ||
          "That's a great question! Our AI is designed to help credit-challenged renters find housing. Feel free to ask me anything about the process!",
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all duration-300 flex items-center justify-center group"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] bg-slate-900 border border-cyan-500/50 rounded-xl shadow-2xl shadow-cyan-500/20 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-b border-cyan-500/30 p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">AI Assistant</h3>
              <p className="text-xs text-cyan-400">Always here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-cyan-500/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.type === "user"
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-gray-300 border border-cyan-500/30"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-3 border-t border-cyan-500/20 space-y-2">
              <p className="text-xs text-gray-400 font-semibold">Quick Questions:</p>
              <div className="space-y-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left text-xs bg-slate-800 hover:bg-slate-700 text-gray-300 p-2 rounded border border-cyan-500/20 hover:border-cyan-500/50 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-cyan-500/20 p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage(input);
              }}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
            <Button
              size="sm"
              onClick={() => handleSendMessage(input)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
