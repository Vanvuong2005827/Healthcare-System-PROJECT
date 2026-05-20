import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaSpinner,
  FaCopy,
  FaChartLine,
  FaExclamationTriangle,
  FaLightbulb,
} from "react-icons/fa";

const QUICK_SUGGESTIONS = [
  "Chiều cao của tôi",
  "Huyết áp của tôi thế nào?",
  "BMI của tôi",
  "Lời khuyên về chế độ ăn",
  "Cách cải thiện giấc ngủ",
];

const formatTimestamp = (timestamp) =>
  timestamp.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const HealthSupportChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Xin chào. Tôi là trợ lý sức khỏe AI của bạn. Hãy hỏi về chỉ số sức khỏe, dữ liệu gần đây hoặc những lưu ý bạn cần theo dõi thêm.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageToSend = inputMessage.trim();

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const patientId = localStorage.getItem("patientId");

      if (!token || !patientId) {
        toast.error("Please login to use health support chat");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("question", messageToSend);

      const response = await fetch("https://ai-chat.whodev.top/ask", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Patient-Id": patientId,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.ok && data.data) {
        const botMessage = {
          id: Date.now() + 1,
          type: "bot",
          content: data.data.text,
          structured: data.data.structured,
          confidence: data.data.confidence,
          meta: data.data.meta,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Không thể kết nối với trợ lý AI. Vui lòng thử lại.");

      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép nội dung.");
  };

  const formatMessageContent = (content) => {
    if (!content) return content;

    try {
      const lines = content
        .split("|")
        .map((line) => line.trim())
        .filter(Boolean);

      const formattedLines = lines.map((line) =>
        line
          .replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="font-semibold text-slate-900">$1</strong>'
          )
          .replace(/→|â†’/g, '<span class="mx-2 text-slate-400">→</span>')
          .replace(
            /^(•|â€¢)\s*(.+)/g,
            '<div class="flex items-start gap-2 pl-1"><span class="mt-1 text-slate-400">•</span><span>$2</span></div>'
          )
          .replace(
            /^(Hướng dẫn:|Lưu ý:|Khuyến nghị:|Note:|HÆ°á»›ng dáº«n:|LÆ°u Ã½:|Khuyáº¿n nghá»‹:)\s*(.+)/g,
            (match, keyword, rest) => {
              const isWarning =
                keyword.includes("Lưu ý") ||
                keyword.includes("Note") ||
                keyword.includes("LÆ°u Ã½");

              if (isWarning) {
                return `<div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <div class="flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <span>!</span>
                    <span>${keyword}</span>
                  </div>
                  <div class="mt-2 text-sm leading-6 text-amber-700">${rest}</div>
                </div>`;
              }

              return `<div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div class="text-sm font-semibold text-slate-900">${keyword}</div>
                <div class="mt-2 text-sm leading-6 text-slate-600">${rest}</div>
              </div>`;
            }
          )
      );

      return formattedLines.join('<div class="h-2"></div>');
    } catch (error) {
      console.error("Error formatting message:", error);
      return content;
    }
  };

  const renderStructuredData = (structured) => {
    if (!structured) return null;

    return (
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <FaChartLine className="text-slate-500" />
          Structured summary
        </h4>

        {structured.conclusion && (
          <div className="mt-4 rounded-2xl bg-white px-4 py-3">
            <p className="text-sm leading-6 text-slate-700">
              {structured.conclusion}
            </p>
          </div>
        )}

        {structured.numbers && structured.numbers.length > 0 && (
          <div className="mt-4">
            <h5 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Measurements
            </h5>
            <div className="mt-3 space-y-2">
              {structured.numbers.map((number, index) => (
                <div
                  key={index}
                  className="flex flex-wrap items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700"
                >
                  <span className="font-semibold text-slate-900">
                    {number.name}
                  </span>
                  <span>
                    {number.value} {number.unit}
                  </span>
                  {number.date && (
                    <span className="text-slate-400">{number.date}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {structured.actions && structured.actions.length > 0 && (
          <div className="mt-4">
            <h5 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
              <FaLightbulb />
              Recommendations
            </h5>
            <div className="mt-3 space-y-2">
              {structured.actions.map((action, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
                >
                  {action}
                </div>
              ))}
            </div>
          </div>
        )}

        {structured.cautions && structured.cautions.length > 0 && (
          <div className="mt-4">
            <h5 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              <FaExclamationTriangle />
              Cautions
            </h5>
            <div className="mt-3 space-y-2">
              {structured.cautions.map((caution, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"
                >
                  {caution}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-[720px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <FaRobot className="text-lg" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                  Trợ lý sức khỏe AI
                </h3>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Hỏi về chỉ số, tình trạng hiện tại hoặc đề xuất lối sống. Nội
                dung phản hồi mang tính hỗ trợ tham khảo.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500 lg:max-w-xs">
            Nếu có dấu hiệu bất thường kéo dài hoặc triệu chứng nghiêm trọng,
            hãy liên hệ bác sĩ ngay.
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 px-5 py-6 sm:px-6">
        <div className="space-y-4">
          {messages.map((message) => {
            const isUser = message.type === "user";

            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-[24px] p-4 shadow-sm sm:max-w-[80%] ${
                    isUser
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isUser
                          ? "bg-white/10 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isUser ? (
                        <FaUser className="text-xs" />
                      ) : (
                        <FaRobot className="text-xs" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {isUser ? (
                        <p className="text-sm leading-6">{message.content}</p>
                      ) : (
                        <div
                          className="text-sm leading-6"
                          dangerouslySetInnerHTML={{
                            __html: formatMessageContent(message.content),
                          }}
                        />
                      )}

                      {!isUser &&
                        message.structured &&
                        renderStructuredData(message.structured)}

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                        <span className={isUser ? "text-slate-300" : "text-slate-400"}>
                          {formatTimestamp(message.timestamp)}
                        </span>

                        {!isUser && message.confidence && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-500">
                            Confidence {Math.round(message.confidence * 100)}%
                          </span>
                        )}

                        {!isUser && (
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="inline-flex items-center gap-1 font-medium text-slate-500 transition-colors duration-200 hover:text-slate-900"
                          >
                            <FaCopy className="text-[11px]" />
                            Copy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                <FaSpinner className="animate-spin text-slate-500" />
                Đang phân tích dữ liệu của bạn...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-5 py-5 sm:px-6">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(event) => setInputMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi về sức khỏe của bạn..."
                className="min-h-[96px] w-full resize-none border-0 bg-transparent px-3 py-3 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400"
                disabled={isLoading}
              />
              <p className="px-3 pb-1 text-xs text-slate-400">
                Nhấn Enter để gửi, Shift + Enter để xuống dòng.
              </p>
            </div>

            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="inline-flex h-12 min-w-[144px] items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <span>Send</span>
              <FaPaperPlane className="text-xs" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInputMessage(suggestion)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthSupportChat;
