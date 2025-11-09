import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import { CryptoPrice } from "@/components/CryptoPrice";
import { useToast } from "@/hooks/use-toast";
import { streamCryptoChat } from "@/utils/cryptoChat";

type Message = { role: "user" | "assistant"; content: string };

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      await streamCryptoChat({
        messages: [...messages, userMessage],
        onDelta: (chunk) => {
          assistantContent += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: assistantContent } : m
              );
            }
            return [...prev, { role: "assistant", content: assistantContent }];
          });
        },
        onDone: () => setIsLoading(false),
        onError: (error) => {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          });
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">CryptoAI</h1>
            <p className="text-xs text-muted-foreground">Your intelligent crypto trading assistant</p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl w-full mx-auto flex gap-4 p-4">
        {/* Sidebar with prices */}
        <div className="w-64 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Live Prices</h2>
          <CryptoPrice symbol="bitcoin" name="Bitcoin" />
          <CryptoPrice symbol="ethereum" name="Ethereum" />
          <CryptoPrice symbol="binancecoin" name="BNB" />
          <CryptoPrice symbol="solana" name="Solana" />
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-card rounded-lg border border-border">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to CryptoAI! 🚀</h2>
                <p className="text-muted-foreground mb-6">
                  I'm your intelligent crypto assistant. Ask me anything about crypto markets, trading strategies, or specific coins!
                </p>
                <div className="space-y-2 text-left text-sm">
                  <p className="text-muted-foreground">Try asking:</p>
                  <button
                    onClick={() => setInput("What's the current market trend for Bitcoin?")}
                    className="block w-full text-left p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    💭 What's the current market trend for Bitcoin?
                  </button>
                  <button
                    onClick={() => setInput("Should I buy Ethereum now?")}
                    className="block w-full text-left p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    💡 Should I buy Ethereum now?
                  </button>
                  <button
                    onClick={() => setInput("Explain what market cap means")}
                    className="block w-full text-left p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    📚 Explain what market cap means
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 p-4">
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground animate-pulse" />
                  </div>
                  <div className="bg-card text-card-foreground rounded-2xl px-4 py-3">
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          )}

          {/* Input area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about crypto markets..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Tip: I can analyze trends, explain concepts, and give trading insights!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
