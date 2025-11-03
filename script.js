 
/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const workerURL = "https://wurkar.rhiannonpickard.workers.dev";

// Store conversation history with system prompt from prompt.js
let conversationHistory = [{
  role: "system",
  content: prompt
}];

// Set initial message
const initialMessage = document.createElement("div");
initialMessage.classList.add("msg", "ai");
initialMessage.textContent = "👋 Hello! I'm your L'Oréal Smart Product Advisor. How can I help you with your beauty routine today?";
chatWindow.appendChild(initialMessage);

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user's message
  const userMessage = userInput.value.trim();
  
  // Don't send empty messages
  if (!userMessage) return;

  // Add user's message to conversation history
  conversationHistory.push({
    role: "user",
    content: userMessage
  });

  // Display user's message in chat window
  displayMessage(userMessage, "user");

  // Clear input field
  userInput.value = "";

  // Show loading indicator
  displayMessage("...", "ai");

  try {
    // Create the request body as a JSON object
    const requestBody = {
      messages: conversationHistory
    };

    // Send request to Cloudflare Worker with messages array as JSON
    const response = await fetch(workerURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the response as JSON
    const data = await response.json();

    // Remove loading indicator
    removeLastMessage();

    // Get AI's response from the data
    const aiMessage = data.choices[0].message.content;

    // Add AI's response to conversation history
    conversationHistory.push({
      role: "assistant",
      content: aiMessage
    });

    // Display AI's response in chat window
    displayMessage(aiMessage, "ai");

  } catch (error) {
    // Remove loading indicator
    removeLastMessage();
    
    // Display error message
    displayMessage("Sorry, I couldn't get a response. Please try again.", "ai");
    
    // Log error for debugging
    console.error("Error:", error);
  }
});

/* Function to display a message in the chat window */
function displayMessage(message, sender) {
  // Create a new div element for the message
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("msg", sender);
  // Display message without "You:" or "AI:" prefixes - the styling makes it clear
  messageDiv.textContent = message;
  
  // Add the message to the chat window
  chatWindow.appendChild(messageDiv);
  
  // Scroll to the bottom of the chat window
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Function to remove the last message (used to remove loading indicator) */
function removeLastMessage() {
  const lastMessage = chatWindow.lastElementChild;
  if (lastMessage) {
    chatWindow.removeChild(lastMessage);
  }
}
