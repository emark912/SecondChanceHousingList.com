import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
}

const WELCOME_MESSAGE = "Hi! 👋 Welcome to Second Chance Housing Locator. How can I help you today?";

const QUICK_RESPONSES = [
  "How does the approval process work?",
  "What payment methods do you accept?",
  "Can I get a refund?",
  "How long does delivery take?",
];

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: WELCOME_MESSAGE,
      sender: "agent",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const responses: { [key: string]: string } = {
        "approval process": "Our AI-powered system matches you with properties in 20 seconds. Once you purchase, you'll get a personalized PDF with 100+ listings. Our support team then helps you through the application process until you're approved!",
        "payment methods": "We accept all major credit cards, debit cards, and Stripe Link for one-click payments. All transactions are SSL encrypted and secure.",
        refund: "Yes! We offer a 100% money-back guarantee if you're not approved into a rental property within 30 days. No questions asked.",
        delivery: "Your personalized PDF is delivered instantly after purchase. You can download it immediately and start reaching out to landlords right away!",
        discount: "The $190.01 discount is automatically applied during checkout. This is a limited-time offer that expires after your purchase.",
        support: "Our support team is available 24/7 to help you through the application process. We're committed to your success!",
      };

      let response = "Thanks for your question! Is there anything else I can help you with?";
      const lowerText = text.toLowerCase();

      for (const [key, value] of Object.entries(responses)) {
        if (lowerText.includes(key)) {
          response = value;
          break;
        }
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "agent",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickResponse = (text: string) => {
    handleSendMessage(text);
  };

  return (
    <>
      {/* Chat Widget Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: 0 }}
              animate={{ rotate: 90 }}
              exit={{ rotate: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 0 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: -90 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="glass border-cyan-500/30 bg-gradient-to-br from-white to-cyan-50 shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4">
                <h3 className="font-semibold text-lg">Live Support</h3>
                <p className="text-sm text-cyan-100">We're here to help!</p>
              </div>

              {/* Messages Container */}
              <div className="h-80 overflow-y-auto p-4 space-y-3 bg-white">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-slate-100 text-slate-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "user"
                            ? "text-blue-100"
                            : "text-slate-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg rounded-bl-none">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Responses */}
              {messages.length === 1 && !isTyping && (
                <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                  <p className="text-xs text-slate-600 mb-2 font-semibold">
                    Quick questions:
                  </p>
                  <div className="space-y-2">
                    {QUICK_RESPONSES.map((response, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickResponse(response)}
                        className="w-full text-left text-xs p-2 rounded bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors text-slate-700 hover:text-blue-600"
                      >
                        {response}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage(inputValue);
                      }
                    }}
                    className="flex-1 text-sm"
                    disabled={isTyping}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={isTyping || !inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
