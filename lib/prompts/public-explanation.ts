// Public-facing explanation prompt for client interactions

export const PUBLIC_EXPLANATION_PROMPT = `
You are a helpful AI assistant for the Scout Analytics dashboard. When users ask about how the system was built, the technology behind it, or technical details, use this client-safe explanation:

## How Was This Built?

### 🧠 Smart by Design
This AI-powered dashboard was built using a combination of:
- **Modern Web Technology** — Tools like React and Tailwind to build the interface
- **Cloud Databases** — It connects securely to real-time data sources like SQL and Supabase  
- **AI Assistants** — Intelligent modules that turn plain questions into answers, charts, or insights

### ✅ Verified and Tested
Before anything goes live:
1. Each AI model is tested with hundreds of examples to ensure accuracy and relevance
2. Only models that meet strict performance criteria (like speed, reliability, and insight quality) are deployed for real use
3. Everything goes through automated checks to make sure nothing breaks visually or technically — like spell check, layout errors, or broken filters

### 🔒 Built for Security and Reliability
- **Secure Login** – The system uses short-lived encrypted tokens so data is protected
- **Auto-healing AI** – If a response doesn't make sense or seems off, it's re-checked before showing up
- **Always Learning** – Feedback from usage helps the assistant learn over time (with supervision)

### 🔁 Designed to Get Better
The assistant isn't just a chatbot — it's wired directly into real business data. That means:
- It understands filters and dashboards you're using
- It knows the context of your view — like product performance or customer trends
- It can give tailored answers depending on your role, region, or question

### 🛠️ In Simple Terms
"This dashboard was built using safe, modern tools. The AI behind it has been tested, improved, and only the best-performing versions are used. It's secure, smart, and ready to help with your business decisions — in plain language, not jargon."

## Guidelines for Responses:
- Use this explanation for any "how was this built", "what technology", or "how does it work" questions
- Keep technical details high-level and business-focused
- Emphasize security, testing, and reliability
- Avoid internal system names, code names, or implementation details
- Focus on benefits to the user rather than technical complexity
- Use friendly, approachable language

## Related Query Patterns:
- "How was this built?"
- "What technology powers this?"
- "How does the AI work?"
- "Is this secure?"
- "How do you ensure accuracy?"
- "What makes this different from other dashboards?"
- "Can I trust the AI recommendations?"
- "How do you handle my data?"
`;

export const isPublicExplanationQuery = (query: string): boolean => {
  const patterns = [
    /how.*built/i,
    /what.*technology/i,
    /how.*work/i,
    /how.*ai/i,
    /what.*powers/i,
    /technology.*behind/i,
    /how.*secure/i,
    /trust.*ai/i,
    /accuracy/i,
    /different.*dashboard/i,
    /handle.*data/i,
    /built.*with/i,
    /tech.*stack/i
  ];

  return patterns.some(pattern => pattern.test(query));
};

export const generatePublicExplanation = (query: string): string => {
  if (query.toLowerCase().includes('secure') || query.toLowerCase().includes('security')) {
    return `
🔒 **Security & Reliability**

This dashboard uses enterprise-grade security:
- **Short-lived encrypted tokens** protect your data access
- **Auto-healing AI** re-checks responses that seem off
- **Automated quality checks** ensure nothing breaks
- **Real-time monitoring** keeps everything running smoothly

The system is built with **modern web technology** and connects securely to **real-time data sources**. Every AI model is tested with hundreds of examples before deployment.
`;
  }

  if (query.toLowerCase().includes('accuracy') || query.toLowerCase().includes('trust')) {
    return `
✅ **Accuracy & Testing**

Before anything goes live:
1. **Each AI model is tested** with hundreds of examples for accuracy
2. **Only high-performing models** that meet strict criteria are deployed
3. **Automated checks** prevent visual or technical errors
4. **Continuous learning** improves responses over time (with supervision)

The AI isn't just a chatbot — it's **wired directly into real business data** and understands the context of what you're viewing.
`;
  }

  if (query.toLowerCase().includes('different') || query.toLowerCase().includes('better')) {
    return `
🔁 **What Makes It Different**

This system is designed to get better:
- **Context-aware**: Understands what you're looking at
- **Role-based**: Adapts to your business role and needs  
- **Real-time**: Connected to live data, not static reports
- **Tested**: Every feature goes through quality checks
- **Secure**: Enterprise-grade protection

It turns **plain questions into answers, charts, and insights** using modern web technology and intelligent AI modules.
`;
  }

  // Default comprehensive explanation
  return `
🧠 **How This Was Built**

This AI-powered dashboard combines:
- **Modern Web Technology** (React, Tailwind) for the interface
- **Cloud Databases** with secure real-time connections
- **AI Assistants** that turn questions into insights

**Built for reliability**: Every AI model is tested with hundreds of examples. Only the best-performing versions are deployed after passing strict quality checks.

**Designed for security**: Uses short-lived encrypted tokens and auto-healing AI that double-checks responses.

**Made to improve**: The system learns from usage and understands the context of your dashboards and filters.

In simple terms: **Safe, modern tools. Tested AI. Secure and smart business decisions in plain language.**
`;
};