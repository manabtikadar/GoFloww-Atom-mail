import { useState } from "react";
import image from "../images/sm.black.png";
import image2 from "../images/modiji.png";

const DeciBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hey there! Welcome to deci.bot " },
    { sender: "bot", image: image2 },
    { sender: "bot", text: "I am deci.bot, your AI-powered email assistant. I can help you draft, reply, and manage your emails efficiently. How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async () => {
    if (!input) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);

    const response = await fetch("http://localhost:5000/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await response.json();
    setMessages([...newMessages, { sender: "bot", text: data.response }]);
    setInput("");
  };

  return (
    <div>
      {isOpen ? (
        <div className="fixed bottom-10 right-10 bg-white w-160 p-4 shadow-lg rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <img src={image} alt="deci.bot" className="w-12 h-12 rounded-full mr-2" />
              <h2 className="text-lg font-bold">deci.bot</h2>
            </div>
            <button className="text-gray-500" onClick={() => setIsOpen(false)}>&#10005;</button>
          </div>
          <div className="h-180 overflow-y-auto p-2 border rounded bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender === "user"
                    ? "text-right mt-1"
                    : "text-left mt-1"
                }
              >
                <strong className="text-gray-700">{msg.sender === "user" ? "You" : "deci.bot"}:</strong>
                {msg.text && <p className={msg.sender === "user" ? "bg-blue-200 p-1 rounded-md" : "bg-gray-200 p-1 rounded-md"}>{msg.text}</p>}
                {msg.image && <img src={msg.image} alt="Bot response" className="max-w-xs mt-1 rounded-md" />}
              </div>
            ))}
          </div>
          <div className="flex mt-2">
            <input
              className="border p-2 flex-grow rounded-l-md"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button className="bg-orange-500 text-white p-2 rounded-r-md" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          className="fixed bottom-10 right-10 w-16 h-16 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-200"
          onClick={() => setIsOpen(true)}
        >
          <img src={image} alt="Deci.bot" className="w-20 rounded-full" />
        </button>
      )}
    </div>
  );
};

export default DeciBot;

