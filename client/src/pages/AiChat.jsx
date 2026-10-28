import { useState } from "react";
import Navbar from "../components/Navbar";
import { API_BASE_URL as API_URL } from "../config";
import { fetchWithRetry } from "../utils/fetchWithRetry";
function AiChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    async function sendMessage(event) {
        event.preventDefault();

        const message = input.trim();

        if (!message || loading) {
            return;
        }

        const userMessage = {
            role: "user",
            content: message,
        };

        setMessages((previous) => [
            ...previous,
            userMessage,
        ]);

        setInput("");
        setLoading(true);

        try {
            const response = await fetchWithRetry(
                `${API_URL}/api/ai/chat`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: message,
                    }),
                },
                { retries: 2, timeout: 60000, retryDelay: 3000 }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.response ||
                    "The AI assistant is temporarily unavailable. Please try again shortly."
                );
            }

            const aiMessage = {
                role: "assistant",
                content:
                    data?.response ||
                    "I couldn't generate a response. Please try again.",
            };

            setMessages((previous) => [
                ...previous,
                aiMessage,
            ]);

        } catch (error) {
            console.error("AI chat error:", error);

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content:
                        "The AI assistant is temporarily unavailable. Please try again shortly.",
                },
            ]);

        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(event) {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            sendMessage(event);
        }
    }

    return (
        <div className="min-h-screen bg-ink-50">

            {/* =====================================================
                SHARED NAVBAR
            ===================================================== */}

            <Navbar />


            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

                <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm">

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="border-b border-ink-200 px-6 py-5">

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-lg font-bold text-white">
                                AI
                            </div>

                            <div>

                                <h1 className="text-xl font-bold text-ink-900">
                                    MediCompare AI
                                </h1>

                                <p className="text-sm text-ink-500">
                                    Your healthcare information assistant
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        CHAT AREA
                    ================================================= */}

                    <div className="min-h-[520px] space-y-5 px-6 py-6">

                        {messages.length === 0 && (

                            <div className="flex min-h-[430px] items-center justify-center">

                                <div className="max-w-xl text-center">

                                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-100 text-2xl font-bold text-brand-600">
                                        AI
                                    </div>

                                    <h2 className="text-2xl font-bold text-ink-900">
                                        How can I help you?
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-ink-500">
                                        Ask me about healthcare topics,
                                        medical terminology, tests,
                                        procedures, or general health
                                        information.
                                    </p>

                                    <div className="mt-6 flex flex-wrap justify-center gap-3">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setInput(
                                                    "What is an MRI scan?"
                                                )
                                            }
                                            className="rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600"
                                        >
                                            What is an MRI scan?
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setInput(
                                                    "When should I see a doctor?"
                                                )
                                            }
                                            className="rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600"
                                        >
                                            When should I see a doctor?
                                        </button>

                                    </div>

                                </div>

                            </div>

                        )}


                        {messages.map((message, index) => (

                            <div
                                key={`${message.role}-${index}`}
                                className={`flex ${
                                    message.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >

                                <div
                                    className={`max-w-[80%] rounded-3xl px-5 py-4 ${
                                        message.role === "user"
                                            ? "rounded-br-md bg-brand-500 text-white"
                                            : "rounded-bl-md bg-ink-100 text-ink-800"
                                    }`}
                                >

                                    <div className="whitespace-pre-wrap text-sm leading-7">
                                        {message.content}
                                    </div>

                                </div>

                            </div>

                        ))}


                        {/* =================================================
                            TYPING INDICATOR
                        ================================================= */}

                        {loading && (

                            <div className="flex justify-start">

                                <div className="rounded-3xl rounded-bl-md bg-ink-100 px-5 py-4">

                                    <div className="flex items-center gap-1.5">

                                        <span className="h-2 w-2 animate-bounce rounded-full bg-ink-400" />

                                        <span
                                            className="h-2 w-2 animate-bounce rounded-full bg-ink-400"
                                            style={{
                                                animationDelay: "150ms",
                                            }}
                                        />

                                        <span
                                            className="h-2 w-2 animate-bounce rounded-full bg-ink-400"
                                            style={{
                                                animationDelay: "300ms",
                                            }}
                                        />

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        INPUT AREA
                    ================================================= */}

                    <div className="border-t border-ink-200 p-5">

                        <form
                            onSubmit={sendMessage}
                            className="flex items-end gap-3"
                        >

                            <textarea
                                value={input}
                                onChange={(event) =>
                                    setInput(event.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                rows={2}
                                maxLength={2000}
                                placeholder="Ask MediCompare AI..."
                                className="min-h-[60px] flex-1 resize-none rounded-2xl border border-ink-200 bg-white px-5 py-4 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50"
                            />

                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    !input.trim()
                                }
                                className="h-[60px] rounded-2xl bg-brand-500 px-7 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? "..." : "Send"}
                            </button>

                        </form>

                        <p className="mt-3 text-center text-xs text-ink-500">
                            MediCompare AI provides general health information
                            and does not replace professional medical advice.
                        </p>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default AiChat;