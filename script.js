 
/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const productGrid = document.getElementById("productGrid");
const savedProducts = document.getElementById("savedProducts");
const productCount = document.getElementById("productCount");
const generateRoutineBtn = document.getElementById("generateRoutineBtn");
const productSearch = document.getElementById("productSearch");
const clearSearchBtn = document.getElementById("clearSearch");
const rtlToggle = document.getElementById("rtlToggle");
const currentLangDisplay = document.getElementById("currentLang");
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
  const lang = translations[currentLanguage];
  
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
      <button class="select-product-btn">${lang.addToRoutine}</button>
    `;
    
    // Click card to toggle description reveal
    card.addEventListener("click", (e) => {
      // Don't toggle if clicking the select button
      if (e.target.classList.contains("select-product-btn")) {
        return;
      }
      // Toggle description visibility
      card.classList.toggle("show-description");
    });
    
    // Select button to add/remove product
    const selectBtn = card.querySelector(".select-product-btn");
    selectBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleProduct(product, card);
    });
    
    productGrid.appendChild(card);
  });
}

// Toggle product selection
function toggleProduct(product, card) {
  const index = selectedProducts.findIndex(p => p.id === product.id);
  const selectBtn = card.querySelector(".select-product-btn");
  const lang = translations[currentLanguage];
  
  if (index > -1) {
    // Remove product
    selectedProducts.splice(index, 1);
    card.classList.remove("selected");
    selectBtn.textContent = lang.addToRoutine;
  } else {
    // Add product
    selectedProducts.push(product);
    card.classList.add("selected");
    selectBtn.textContent = lang.remove;
  }
  
  updateSavedProducts();
}

// Update saved products display
function updateSavedProducts() {
  const lang = translations[currentLanguage];
  productCount.textContent = selectedProducts.length;
  
  if (selectedProducts.length === 0) {
    savedProducts.innerHTML = `<p class="empty-state">${lang.noProducts}</p>`;
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

// Search functionality
function searchProducts(query) {
  const searchTerm = query.toLowerCase().trim();
  const cards = productGrid.querySelectorAll(".product-card");
  let visibleCount = 0;
  
  cards.forEach(card => {
    const productId = parseInt(card.dataset.productId);
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const matchesName = product.name.toLowerCase().includes(searchTerm);
    const matchesCategory = product.category.toLowerCase().includes(searchTerm);
    const matchesDescription = product.description.toLowerCase().includes(searchTerm);
    
    if (searchTerm === "" || matchesName || matchesCategory || matchesDescription) {
      card.style.display = "block";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });
  
  // Show/hide "no results" message
  let noResultsMsg = productGrid.querySelector(".no-results");
  if (visibleCount === 0 && searchTerm !== "") {
    if (!noResultsMsg) {
      noResultsMsg = document.createElement("div");
      noResultsMsg.classList.add("no-results");
      noResultsMsg.innerHTML = `
        <p>No products found for "${query}"</p>
        <p class="search-hint">Try searching for "skincare", "haircare", "makeup", or specific product names</p>
      `;
      productGrid.appendChild(noResultsMsg);
    }
  } else if (noResultsMsg) {
    noResultsMsg.remove();
  }
  
  // Show/hide clear button
  clearSearchBtn.style.display = searchTerm ? "flex" : "none";
}

// Search input event listener
productSearch.addEventListener("input", (e) => {
  searchProducts(e.target.value);
});

// Clear search button
clearSearchBtn.addEventListener("click", () => {
  productSearch.value = "";
  searchProducts("");
  productSearch.focus();
});

// Allow Enter key to focus on search
productSearch.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
  }
});

// RTL Language Support
let currentLanguage = localStorage.getItem("language") || "en";

const translations = {
  en: {
    code: "EN",
    dir: "ltr",
    greeting: "👋 Hello! I'm your L'Oréal Smart Product Advisor. Select products above or ask me anything about your beauty routine!",
    searchPlaceholder: "🔍 Search products by name or category...",
    selectTitle: "Select Products for Your Routine",
    selectedProducts: "Your Selected Products",
    noProducts: "No products selected yet. Click on products above to add them!",
    generateBtn: "Generate My Routine",
    chatTitle: "Chat with Your Smart Advisor",
    inputPlaceholder: "Ask me about products or routines…",
    addToRoutine: "Add to Routine",
    remove: "Remove"
  },
  ar: {
    code: "AR",
    dir: "rtl",
    greeting: "👋 مرحباً! أنا مستشارك الذكي لمنتجات لوريال. اختر المنتجات أعلاه أو اسألني عن روتين جمالك!",
    searchPlaceholder: "🔍 ابحث عن المنتجات بالاسم أو الفئة...",
    selectTitle: "اختر المنتجات لروتينك",
    selectedProducts: "المنتجات المختارة",
    noProducts: "لم يتم اختيار منتجات بعد. انقر على المنتجات أعلاه لإضافتها!",
    generateBtn: "إنشاء روتيني",
    chatTitle: "تحدث مع مستشارك الذكي",
    inputPlaceholder: "اسألني عن المنتجات أو الروتين...",
    addToRoutine: "أضف للروتين",
    remove: "إزالة"
  }
};

function toggleLanguage() {
  // Toggle between en and ar
  currentLanguage = currentLanguage === "en" ? "ar" : "en";
  localStorage.setItem("language", currentLanguage);
  
  const lang = translations[currentLanguage];
  
  // Update HTML dir attribute
  document.body.setAttribute("dir", lang.dir);
  
  // Update language display
  currentLangDisplay.textContent = lang.code;
  
  // Update UI text elements
  productSearch.placeholder = lang.searchPlaceholder;
  userInput.placeholder = lang.inputPlaceholder;
  
  const sectionTitles = document.querySelectorAll(".section-title");
  if (sectionTitles[0]) sectionTitles[0].textContent = lang.selectTitle;
  if (sectionTitles[1]) sectionTitles[1].textContent = lang.chatTitle;
  
  const sectionSubtitle = document.querySelector(".section-subtitle");
  if (sectionSubtitle) {
    const count = productCount.textContent;
    sectionSubtitle.innerHTML = `${lang.selectedProducts} (<span id="productCount">${count}</span>)`;
  }
  
  generateRoutineBtn.textContent = lang.generateBtn;
  
  // Update empty state message
  if (selectedProducts.length === 0) {
    const emptyState = savedProducts.querySelector(".empty-state");
    if (emptyState) {
      emptyState.textContent = lang.noProducts;
    }
  }
  
  // Update product buttons
  document.querySelectorAll(".select-product-btn").forEach((btn, index) => {
    const card = btn.closest(".product-card");
    const productId = parseInt(card.dataset.productId);
    const isSelected = selectedProducts.some(p => p.id === productId);
    btn.textContent = isSelected ? lang.remove : lang.addToRoutine;
  });
  
  // Update initial chat message if it's the only message
  if (chatWindow.children.length === 1) {
    chatWindow.children[0].textContent = lang.greeting;
  }
}

// RTL Toggle button event
rtlToggle.addEventListener("click", toggleLanguage);

// Initialize language on load
if (currentLanguage === "ar") {
  document.body.setAttribute("dir", "rtl");
  currentLangDisplay.textContent = "AR";
}

// Initialize products on page load
initProductGrid();

// Set initial message
const initialMessage = document.createElement("div");
initialMessage.classList.add("msg", "ai");
initialMessage.textContent = translations[currentLanguage].greeting;
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
