import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Mic, MicOff, Send } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SenderRole } from "../backend.d";
import { DeliveryTimeline } from "../components/DeliveryTimeline";
import { ItemStatusBadge } from "../components/StatusBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useOrderById,
  useOrderChat,
  useSendChatMessage,
} from "../hooks/useQueries";

// Speech recognition types
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  onresult:
    | ((e: {
        results: {
          [index: number]: { [index: number]: { transcript: string } };
        };
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

function ChatBubble({
  message,
  isCustomer,
}: { message: string; isCustomer: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isCustomer ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isCustomer
            ? "bg-primary text-white rounded-br-sm"
            : "bg-gray-100 text-foreground rounded-bl-sm"
        }`}
      >
        {message}
      </div>
    </motion.div>
  );
}

export function OrderDetailPage() {
  const { orderId } = useParams({ from: "/orders/$orderId" });
  const orderIdNum = Number.parseInt(orderId, 10);
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: order, isLoading: orderLoading } = useOrderById(orderIdNum);
  const { data: chat, isLoading: chatLoading } = useOrderChat(orderIdNum);
  const sendMessage = useSendChatMessage();
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll on chat update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.length]);

  const handleSend = async () => {
    const text = message.trim();
    if (!text) return;
    setMessage("");
    try {
      await sendMessage.mutateAsync({ orderId: orderIdNum, message: text });
    } catch {
      toast.error("Failed to send message");
      setMessage(text);
    }
  };

  const handleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  if (orderLoading) {
    return (
      <div
        className="max-w-[480px] mx-auto px-4 py-4 space-y-3"
        data-ocid="order_detail.loading_state"
      >
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div
        className="max-w-[480px] mx-auto px-4 py-8 text-center text-muted-foreground"
        data-ocid="order_detail.error_state"
      >
        Order not found.
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 py-4 pb-6">
      <button
        type="button"
        onClick={() => navigate({ to: "/orders" })}
        className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors font-medium"
        data-ocid="order_detail.back.button"
      >
        <ArrowLeft className="w-4 h-4" /> My Orders
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">Order #{order.id}</h1>
        <div>
          {order.finalTotal ? (
            <p
              className="text-sm font-bold"
              style={{ color: "oklch(0.82 0.17 84)" }}
            >
              ₹{order.finalTotal}
            </p>
          ) : (
            <p className="text-sm font-medium text-muted-foreground">
              est. ₹{order.estimatedTotal}
            </p>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <Card className="bg-white shadow-card rounded-2xl mb-4 border-border">
        <CardContent className="p-4">
          <DeliveryTimeline status={order.status} />
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="bg-white shadow-card rounded-2xl mb-4 border-border">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-bold">Items</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {order.items.map((item, idx) => (
            <motion.div
              key={item.itemName}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between"
              data-ocid={`order_detail.item.${idx + 1}`}
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {item.itemName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity.toString()}
                  {" · "}
                  {item.confirmedPrice !== undefined
                    ? `₹${item.confirmedPrice}`
                    : `est. ₹${item.estimatedPrice}`}
                </p>
                {item.alternativeSuggestion && (
                  <p className="text-xs text-amber-700 mt-0.5">
                    Alt: {item.alternativeSuggestion}
                  </p>
                )}
              </div>
              <ItemStatusBadge status={item.status} />
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Chat — WhatsApp style */}
      <Card className="bg-white shadow-card rounded-2xl border-border overflow-hidden">
        <CardHeader className="px-4 pt-3 pb-2 bg-primary">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-base">
              🏪
            </div>
            Chat with Shop
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Chat messages area */}
          <div
            className="h-72 overflow-y-auto px-4 py-3 space-y-1 bg-gray-50"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
            data-ocid="order_detail.chat.panel"
          >
            {chatLoading ? (
              <div
                className="flex justify-center pt-8"
                data-ocid="order_detail.chat.loading_state"
              >
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : chat && chat.length > 0 ? (
              chat.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg.message}
                  isCustomer={msg.senderRole === SenderRole.customer}
                />
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">
                No messages yet. Ask about your order!
              </p>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input bar */}
          {identity && (
            <div
              className="flex gap-2 px-3 py-3 bg-white border-t border-border"
              data-ocid="order_detail.chat.input"
            >
              <button
                type="button"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center bg-accent hover:bg-border transition-colors flex-shrink-0"
                onClick={handleVoice}
                disabled={isListening}
                data-ocid="order_detail.chat.voice.button"
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 text-red-500" />
                ) : (
                  <Mic className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <Input
                placeholder={isListening ? "Listening..." : "Type a message..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 rounded-full bg-gray-100 border-0 px-4 text-sm h-9"
              />
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0 disabled:opacity-50"
                onClick={handleSend}
                disabled={sendMessage.isPending || !message.trim()}
                data-ocid="order_detail.chat.send.button"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
