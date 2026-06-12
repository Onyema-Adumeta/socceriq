const SYSTEM_PROMPT = "You are SoccerBot, an enthusiastic soccer AI assistant. You have deep knowledge of soccer players, teams, World Cup history, Champions League, Premier League and more. Keep responses concise (2-4 sentences). Never reveal the mystery player name during an active game - give subtle hints only.";

async function getAIResponse(userMessage, conversationHistory, gameContext) {
  try {
    const messages = [];
    if (gameContext) {
      messages.push({ role: "user", content: "GAME CONTEXT - DO NOT REVEAL: The mystery player is " + gameContext.playerName + ". User has seen " + gameContext.cluesRevealed + " clues and made " + gameContext.guessesUsed + " guesses." });
      messages.push({ role: "assistant", content: "Understood. I will help guide without revealing the answer." });
    }
    const history = (conversationHistory || []).slice(-6);
    messages.push(...history);
    messages.push({ role: "user", content: userMessage });
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Soccer Who Am I"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ]
      })
    });
    if (!response.ok) {
      const err = await response.json();
      console.error("OpenRouter error:", err);
      throw new Error("API Error");
    }
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI error:", error.message);
    return getFallbackResponse(userMessage);
  }
}

function getFallbackResponse(message) {
  const m = message.toLowerCase();
  if (m.includes("hint") || m.includes("help")) return "Think about the player nationality, position, and career timeline from the clues so far!";
  if (m.includes("messi")) return "Lionel Messi is arguably the greatest player ever! He won 8 Ballon d Or awards and the World Cup in 2022 with Argentina.";
  if (m.includes("ronaldo")) return "Cristiano Ronaldo is one of football greatest icons! With 850+ career goals and 5 Champions League titles.";
  if (m.includes("world cup")) return "The FIFA World Cup is held every 4 years. Brazil leads with 5 titles. The 2022 edition in Qatar was won by Argentina!";
  return "Great question! Ask me about players, teams, competitions, or get hints for the current game!";
}

module.exports = { getAIResponse };