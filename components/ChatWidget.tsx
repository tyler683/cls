// Inside your ChatWidget.tsx component
const [isTyping, setIsTyping] = useState(false);

const sendMessage = async (input: string) => {
  if (!input.trim()) return;
  
  const userMessage = { role: 'user', content: input };
  setMessages(prev => [...prev, userMessage]);
  setIsTyping(true);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "You are the CLS Assistant. Expert in Kansas City landscaping." }] }
      ]
    });

    const result = await chat.sendMessageStream(input);
    
    // Create placeholder for assistant message
    setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

    let accumulatedText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      accumulatedText += chunkText;
      
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        const others = prev.slice(0, -1);
        return [...others, { ...lastMsg, content: accumulatedText }];
      });
    }
  } catch (err) {
    console.error("AI Error:", err);
  } finally {
    setIsTyping(false);
  }
};
