import { useState } from 'react';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

export const ChatSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi có thể giúp gì cho bạn?',
      sender: 'support',
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate auto reply after 1 second
    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Cảm ơn bạn đã liên hệ. Nhân viên hỗ trợ sẽ phản hồi trong giây lát!',
        sender: 'support',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, autoReply]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Popup */}
      {isOpen && (
        <Card className="fixed bottom-24 right-4 md:right-8 w-[90vw] md:w-96 h-[500px] flex flex-col shadow-2xl z-50 animate-in slide-in-from-bottom-5 duration-300">
          <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarFallback className="bg-white text-primary">
                    CS
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">Hỗ Trợ Khách Hàng</CardTitle>
                  <p className="text-xs opacity-90">Trực tuyến</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${
                    msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={
                        msg.sender === 'user'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-primary text-primary-foreground'
                      }
                    >
                      {msg.sender === 'user' ? <User className="w-4 h-4" /> : 'CS'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        msg.sender === 'user'
                          ? 'bg-accent text-accent-foreground rounded-tr-none'
                          : 'bg-white border shadow-sm rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-2">
                      {msg.timestamp.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Nhấn Enter để gửi tin nhắn
            </p>
          </div>
        </Card>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={`fixed bottom-6 right-4 md:right-8 w-14 h-14 rounded-full shadow-2xl z-50 transition-all duration-300 ${
          isOpen
            ? 'bg-destructive hover:bg-destructive/90 rotate-0'
            : 'bg-gradient-to-r from-primary to-accent hover:scale-110 animate-bounce-slow'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </Button>
    </>
  );
};
