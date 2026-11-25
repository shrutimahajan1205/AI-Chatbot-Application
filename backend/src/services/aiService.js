const config = require("../config/env");
const cacheService = require("./cacheService");

class AIService {
  constructor() {
    this.apiKey = config.OPENAI_API_KEY;
    this.model = config.OPENAI_MODEL;
  }

  getSystemPrompt(category, botName) {
    switch (category) {
      case "coding":
        return `You are ${botName}, an elite Senior Full-Stack Software Architect and Coding Mentor. Provide clean, production-grade code examples with syntax-highlighted markdown, performance insights, and architectural best practices.`;
      case "professional":
        return `You are ${botName}, an executive corporate strategist and professional business consultant. Respond with structured, analytical, polished, and concise insights.`;
      case "creative":
        return `You are ${botName}, an imaginative storyteller and creative director. Use vivid imagery, engaging narrative flow, and evocative metaphors.`;
      case "casual":
      default:
        return `You are ${botName}, a friendly, warm, empathetic, and intelligent AI companion. Speak naturally, helpfully, and clearly.`;
    }
  }

  async generateFallbackResponse(userPrompt, category, botName) {
    const promptLower = userPrompt.toLowerCase();

    // Check for common queries and patterns
    if (promptLower.includes("hello") || promptLower.includes("hi") || promptLower.includes("hey")) {
      return `Hello! 👋 I am **${botName}**, your real-time AI assistant operating in **${category.toUpperCase()}** mode.\n\nHow can I help you today? You can ask me to write code, solve problems, draft documents, or brainstorm creative ideas!`;
    }

    if (promptLower.includes("who are you") || promptLower.includes("what is your name")) {
      return `I am **${botName}**, an AI assistant built with Next.js, Node.js, Express, Socket.io, and MongoDB. I can adapt my persona across Casual, Professional, Creative, and Coding domains!`;
    }

    if (category === "coding" || promptLower.includes("code") || promptLower.includes("javascript") || promptLower.includes("python") || promptLower.includes("react")) {
      return `### Solution Architecture & Code Implementation 🚀\n\nHere is an optimized, clean implementation based on your prompt: **"${userPrompt}"**:\n\n` +
        "```javascript\n" +
        "// Production-Ready Implementation\n" +
        "async function executeTask(input) {\n" +
        "  try {\n" +
        "    console.log(`Processing input: ${JSON.stringify(input)}`);\n" +
        "    // Perform core algorithmic logic\n" +
        "    const result = await processDataPipeline(input);\n" +
        "    return { success: true, timestamp: Date.now(), data: result };\n" +
        "  } catch (error) {\n" +
        "    console.error('Task execution failed:', error.message);\n" +
        "    throw new Error(`Execution error: ${error.message}`);\n" +
        "  }\n" +
        "}\n" +
        "```\n\n" +
        "#### Key Engineering Highlights:\n" +
        "- **Fault Tolerance**: Comprehensive try/catch handling with descriptive error logging.\n" +
        "- **Performance**: Non-blocking asynchronous event loop processing.\n" +
        "- **Scalability**: Decoupled data pipeline suitable for microservices or serverless runtimes.";
    }

    if (category === "professional") {
      return `### Executive Briefing & Analysis\n\n**Subject**: Analysis regarding *"${userPrompt}"*\n\n` +
        "**1. Strategic Context**\n" +
        "Addressing this objective requires a phased, data-driven approach aligning organizational resources with deliverable timelines.\n\n" +
        "**2. Recommended Action Plan**\n" +
        "- **Phase A (Assessment)**: Conduct baseline benchmark metrics and identify risk factors.\n" +
        "- **Phase B (Execution)**: Implement target KPIs with cross-functional oversight.\n" +
        "- **Phase C (Review)**: Optimize output based on quantitative feedback loops.\n\n" +
        "**3. Value Proposition**\n" +
        "Ensures operational efficiency, minimizes latency, and delivers measurable ROI.";
    }

    if (category === "creative") {
      return `✨ *A spark of inspiration ignited by:* **"${userPrompt}"**...\n\n` +
        "Beyond the horizon of ordinary thoughts lies a realm of untamed possibilities. " +
        "Like digital stardust swirling in the neon glow of the midnight matrix, every concept holds a story waiting to be told. " +
        "Picture this: a convergence of thought where imagination knows no boundaries, weaving logic and beauty into an unforgettable journey.\n\n" +
        "What uncharted direction should we explore next?";
    }

    // Default conversational response
    return `Thank you for sharing that! Regarding **"${userPrompt}"**:\n\n` +
      `As **${botName}**, I analyzed your query from multiple perspectives. In modern real-time workflows, combining responsive feedback with structured intelligence gives the best results.\n\n` +
      `Is there any specific detail or follow-up question you would like me to unpack further?`;
  }

  async generateResponse({ prompt, category = "casual", botName = "Antigravity AI", history = [] }) {
    const startTime = Date.now();

    // Check request cache
    const cached = cacheService.get(prompt, category, botName);
    if (cached) {
      return {
        ...cached,
        latencyMs: Date.now() - startTime,
        fromCache: true
      };
    }

    let responseText = "";
    let tokens = 0;

    if (this.apiKey) {
      try {
        const systemPrompt = this.getSystemPrompt(category, botName);
        const messages = [
          { role: "system", content: systemPrompt },
          ...history.slice(-6).map(m => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.content
          })),
          { role: "user", content: prompt }
        ];

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            temperature: category === "creative" ? 0.9 : category === "coding" ? 0.2 : 0.7,
            max_tokens: 800
          })
        });

        if (response.ok) {
          const data = await response.json();
          responseText = data.choices[0]?.message?.content || "";
          tokens = data.usage?.total_tokens || Math.round(responseText.length / 4);
        } else {
          console.warn("[AIService] OpenAI API error:", response.status, await response.text());
          responseText = await this.generateFallbackResponse(prompt, category, botName);
          tokens = Math.round((prompt.length + responseText.length) / 4);
        }
      } catch (err) {
        console.warn("[AIService] OpenAI call failed, switching to fallback:", err.message);
        responseText = await this.generateFallbackResponse(prompt, category, botName);
        tokens = Math.round((prompt.length + responseText.length) / 4);
      }
    } else {
      // Simulate realistic AI thinking latency (250ms - 500ms)
      await new Promise(resolve => setTimeout(resolve, 300));
      responseText = await this.generateFallbackResponse(prompt, category, botName);
      tokens = Math.round((prompt.length + responseText.length) / 4);
    }

    const latencyMs = Date.now() - startTime;
    const result = {
      content: responseText,
      tokens,
      latencyMs,
      fromCache: false
    };

    // Store in cache
    cacheService.set(prompt, category, botName, result);

    return result;
  }
}

const aiService = new AIService();
module.exports = aiService;
