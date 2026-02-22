import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send, Bot, User, Sparkles, BookOpen, Code, Brain, Lightbulb, AlertCircle } from "lucide-react";

const quickQuestions = [
  { icon: Code, text: "How to prepare for coding interviews?" },
  { icon: Brain, text: "Tips for aptitude tests?" },
  { icon: BookOpen, text: "Best resources for DSA?" },
  { icon: Lightbulb, text: "Common HR interview questions?" },
];

// Local fallback responses when API is not available
const aiResponses = {
  coding: `**Coding Interview Preparation Tips:**

1. **Master Data Structures**: Arrays, Linked Lists, Trees, Graphs, Hash Tables
2. **Learn Key Algorithms**: Sorting, Searching, Dynamic Programming, Recursion
3. **Practice Daily**: Solve 2-3 LeetCode problems daily
4. **Understand Patterns**: Two Pointers, Sliding Window, Binary Search
5. **Mock Interviews**: Practice explaining your thought process

**Recommended Platforms**: LeetCode, HackerRank, CodeForces`,

  aptitude: `**Aptitude Test Preparation Tips:**

1. **Quantitative Aptitude**: Number Systems, Percentages, Ratios, Time & Work
2. **Logical Reasoning**: Blood Relations, Seating Arrangements, Syllogisms
3. **Verbal Ability**: Reading Comprehension, Grammar, Vocabulary

**Practice Strategy**:
- Take timed mock tests regularly
- Learn shortcut techniques
- Practice mental math`,

  dsa: `**Best Resources for DSA:**

📚 **Books**: "Introduction to Algorithms" (CLRS), "Cracking the Coding Interview"

🌐 **Online Platforms**: LeetCode, GeeksforGeeks, HackerRank

📹 **Video Courses**: Abdul Bari's Algorithm Playlist, Striver's SDE Sheet`,

  hr: `**Common HR Interview Questions:**

- Tell me about yourself
- Why this company?
- Strengths & Weaknesses
- Where do you see yourself in 5 years?

**Tips**: Maintain eye contact, be confident, prepare STAR method stories`,

  default: `I'm your AI Placement Preparation Assistant! 🎯

I can help you with:
• Coding Interview Prep
• Aptitude Tests
• Technical Topics
• HR Interview

Feel free to ask any placement-related questions!`
};

function getLocalFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("coding") || lowerMessage.includes("programming")) {
    return aiResponses.coding;
  }
  if (lowerMessage.includes("aptitude") || lowerMessage.includes("quantitative")) {
    return aiResponses.aptitude;
  }
  if (lowerMessage.includes("dsa") || lowerMessage.includes("data structure") || lowerMessage.includes("resource")) {
    return aiResponses.dsa;
  }
  if (lowerMessage.includes("hr") || lowerMessage.includes("interview question")) {
    return aiResponses.hr;
  }
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! 👋 I'm your AI Placement Assistant. How can I help you today?";
  }
  if (lowerMessage.includes("thank")) {
    return "You're welcome! 😊 Best of luck with your preparation!";
  }
  
  return aiResponses.default;
}

export function AIChatbot() {
  const [messages, setMessages] = useState([
    { id: "1", role: "assistant", content: "Hello! 👋 I'm your AI Placement Assistant. How can I help you today?", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isAiOnline, setIsAiOnline] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    async function loadAIStatus() {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${apiBaseUrl}/api/ai/status`);
        const data = await response.json().catch(() => ({}));
        if (!isMounted) return;
        setIsAiOnline(Boolean(data.configured));
        if (!data.configured) {
          setApiError("Gemini API key is not configured on the server.");
        }
      } catch {
        if (!isMounted) return;
        setIsAiOnline(false);
        setApiError("Cannot reach backend AI service. Ensure server is running on port 5000.");
      }
    }

    loadAIStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSend = async (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    // Build conversation history for context (exclude system messages)
    const history = messages
      .filter(m => m.role !== "system")
      .map(m => ({
        role: m.role,
        content: m.content
      }));

    // Add user message immediately
    const userMessage = { 
      id: Date.now().toString(), 
      role: "user", 
      content: messageText, 
      timestamp: new Date() 
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setApiError(null);

    try {
      // Get API base URL from environment or use relative path
      const apiBaseUrl = import.meta.env.VITE_API_URL || '';
      
      // Call our backend AI endpoint
      const response = await fetch(`${apiBaseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          message: messageText,
          history: history
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.response) {
        // Add AI response from API
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      } else if (data.error) {
        const errorText = data.details || data.message || data.error;
        setApiError(errorText);
        const aiErrorMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Gemini request failed: ${errorText}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiErrorMessage]);
      } else {
        throw new Error("No response from AI");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const message = error?.message || "Unknown error";
      setApiError(message);
      const aiErrorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Gemini request failed: ${message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiErrorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 fade-up">
      <Card className="h-[calc(100vh-12rem)] flex flex-col glass-panel">
        <CardHeader className="border-b border-white/30 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Placement Assistant</CardTitle>
              <p className="text-sm text-blue-100">Powered by Gemini AI</p>
            </div>
            <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              {isAiOnline ? "Gemini Online" : "Gemini Offline"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          {/* API Error Banner */}
          {apiError && (
            <div className="mx-4 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-800 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8">
                <AvatarFallback className={message.role === "user" ? "bg-blue-600 text-white" : "bg-violet-600 text-white"}>
                    {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-violet-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => handleSend(q.text)}
                  >
                    <q.icon className="h-3 w-3 mr-1" />
                    {q.text}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-200/80 p-4 bg-white/70">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about placements..."
                className="flex-1 bg-white"
                disabled={isTyping}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className=""
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
