 
/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const productGrid = document.getElementById("productGrid");
const savedProducts = document.getElementById("savedProducts");
const productCount = document.getElementById("productCount");
const generateRoutineBtn = document.getElementById("generateRoutineBtn");
const workerURL = "https://wurkar.rhiannonpickard.workers.dev";

// Store conversation history with system prompt from prompt.js
let conversationHistory = [{
  role: "system",
  content: prompt
}];

// Store selected products
let selectedProducts = [];

// L'Oréal product catalog
const products = [
  {
    id: 1,
    name: "Revitalift Anti-Wrinkle Cream",
    category: "Skincare",
    icon: "💆‍♀️",
    description: "Advanced anti-aging formula with Pro-Retinol to reduce wrinkles and firm skin."
  },
  {
    id: 2,
    name: "Elvive Total Repair Shampoo",
    category: "Haircare",
    icon: "🧴",
    description: "Repairs damaged hair with ceramides and protein for stronger, healthier locks."
  },
  {
    id: 3,
    name: "Infallible 24H Foundation",
    category: "Makeup",
    icon: "💄",
    description: "Long-lasting full coverage foundation with SPF 25 that stays flawless all day."
  },
  {
    id: 4,
    name: "Hydra Genius Moisturizer",
    category: "Skincare",
    icon: "💧",
    description: "Lightweight gel moisturizer with aloe water and hyaluronic acid for 72H hydration."
  },
  {
    id: 5,
    name: "Paradise Mascara",
    category: "Makeup",
    icon: "👁️",
    description: "Volumizing mascara with castor oil for soft, feathery lashes without clumps."
  },
  {
    id: 6,
    name: "Color Vibrancy Shampoo",
    category: "Haircare",
    icon: "🌈",
    description: "Protects color-treated hair and extends vibrancy with UV filters."
  },
  {
    id: 7,
    name: "Pure Clay Detox Mask",
    category: "Skincare",
    icon: "🧖‍♀️",
    description: "Draws out impurities and clarifies skin with three pure clays and charcoal."
  },
  {
    id: 8,
    name: "Glossy Balm Lip Color",
    category: "Makeup",
    icon: "💋",
    description: "Nourishing lip balm with sheer color and shine. Hydrates for up to 8 hours."
  }
];

// Initialize product grid
function initProductGrid() {
  products.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.dataset.productId = product.id;
    
    card.innerHTML = `
      <div class="selection-badge">✓</div>
      <div class="product-image">${product.icon}</div>
      <div class="product-category">${product.category}</div>
      <div class="product-name">${product.name}</div>
      <div class="product-description">${product.description}</div>
    `;
    
    // Click to select/deselect product
    card.addEventListener("click", () => toggleProduct(product, card));
    
    // Double-click to reveal description
    card.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      card.classList.toggle("show-description");
    });
    
    productGrid.appendChild(card);
  });
}

// Toggle product selection
function toggleProduct(product, card) {
  const index = selectedProducts.findIndex(p => p.id === product.id);
  
  if (index > -1) {
    // Remove product
    selectedProducts.splice(index, 1);
    card.classList.remove("selected");
  } else {
    // Add product
    selectedProducts.push(product);
    card.classList.add("selected");
  }
  
  updateSavedProducts();
}

// Update saved products display
function updateSavedProducts() {
  productCount.textContent = selectedProducts.length;
  
  if (selectedProducts.length === 0) {
    savedProducts.innerHTML = '<p class="empty-state">No products selected yet. Click on products above to add them!</p>';
    generateRoutineBtn.style.display = "none";
  } else {
    savedProducts.innerHTML = "";
    selectedProducts.forEach(product => {
      const tag = document.createElement("div");
      tag.classList.add("saved-product-tag");
      tag.innerHTML = `
        ${product.icon} ${product.name}
        <button class="remove-btn">×</button>
      `;
      
      tag.querySelector(".remove-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        const card = productGrid.querySelector(`[data-product-id="${product.id}"]`);
        toggleProduct(product, card);
      });
      
      savedProducts.appendChild(tag);
    });
    generateRoutineBtn.style.display = "block";
  }
}

// Generate routine button handler
generateRoutineBtn.addEventListener("click", () => {
  if (selectedProducts.length === 0) return;
  
  const productNames = selectedProducts.map(p => p.name).join(", ");
  const message = `I've selected these products: ${productNames}. Can you create a personalized beauty routine for me?`;
  
  // Set the input value and trigger form submission
  userInput.value = message;
  chatForm.dispatchEvent(new Event("submit"));
});

// Initialize products on page load
initProductGrid();

// Set initial message
const initialMessage = document.createElement("div");
initialMessage.classList.add("msg", "ai");
initialMessage.textContent = "👋 Hello! I'm your L'Oréal Smart Product Advisor. Select products above or ask me anything about your beauty routine!";
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
