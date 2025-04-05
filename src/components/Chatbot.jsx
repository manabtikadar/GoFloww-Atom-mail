import { useState, useRef, useEffect } from "react";
import image from "../images/sm.black.png";  
import image2 from "../images/modiji.png";   

const DeciBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hey there! Welcome to deci.bot" },
    { sender: "bot", text: "I am deci.bot, your AI-powered email assistant. I can help you draft, reply, and manage your emails efficiently. How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { sender: "user", text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    setMessages(prev => [...prev, { sender: "bot", text: "Typing...", isTyping: true }]);

    try {
      const response = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      setTimeout(() => {
        setMessages(prev => [...prev.filter(msg => !msg.isTyping), { sender: "bot", text: data.response }]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        setMessages(prev => [...prev.filter(msg => !msg.isTyping), { sender: "bot", text: "Sorry, I encountered an error. Please try again." }]);
        setLoading(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  return (
    <div className="font-sans">
      {isOpen ? (
        <div className="fixed bottom-4 right-4 w-full max-w-4xl mx-4 sm:mx-0 sm:w-[48rem] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 transform"
             style={{ maxHeight: "calc(100vh - 8rem)", height: "auto" }}>
          
          {/* Header */}
          <div className="flex justify-between items-center p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <img src={image} alt="deci.bot" className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-black" />
              <div>
                <h2 className="font-semibold text-lg sm:text-xl">deci.bot</h2>
                <p className="text-xs sm:text-sm opacity-80">AI Email Assistant</p>
              </div>
            </div>
            <button 
              className="p-1 sm:p-2 rounded-full hover:bg-blue-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="h-[calc(100vh-20rem)] sm:h-[32rem] p-4 sm:p-6 overflow-y-auto bg-gray-50 space-y-3 sm:space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <img src={image} alt="Bot" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 self-start mt-1 flex-shrink-0 border-2 border-black" />
                )}
                <div
                  className={`max-w-[80%] p-3 sm:p-4 rounded-xl text-sm sm:text-base transition-all duration-200 ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-tr-none"
                      : "bg-white text-gray-800 shadow-sm rounded-tl-none border border-gray-100"
                  }`}
                >
                  {loading && msg.isTyping ? (
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
                {msg.sender === "user" && (
                  <img src={image2} alt="You" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ml-2 sm:ml-3 self-start mt-1 flex-shrink-0 border-2 border-black" />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <input
                className="flex-1 border border-gray-200 rounded-full py-2 px-4 sm:py-3 sm:px-6 text-sm sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
              />
              <button
                className={`p-2 sm:p-3 rounded-full ${loading ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
                onClick={sendMessage}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 sm:mt-3 text-center">
              deci.bot may produce inaccurate information
            </p>
          </div>
        </div>
      ) : (
        <button
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-white shadow-xl border border-gray-200 hover:shadow-2xl transition-all hover:scale-105"
          onClick={() => setIsOpen(true)}
        >
          <img src={image} alt="Deci.bot" className="w-12 sm:w-16 rounded-full" />
          <span className="absolute top-0 right-0 sm:top-1 sm:right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white"></span>
        </button>
      )}
    </div>
  );
};

export default DeciBot;


