import { getFirestore, doc, getDoc, updateDoc, collection, setDoc } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js';

const firebaseConfig = {
  apiKey: "AIzaSyAmPEw18Uo3Q4lWzEdn5z4w8K7hAfjB3rY",
  authDomain: "ultimate-cf952.firebaseapp.com",
  projectId: "ultimate-cf952",
  storageBucket: "ultimate-cf952.firebasestorage.app",
  messagingSenderId: "686149530352",
  appId: "1:686149530352:web:147d61bbd55c6a9dbd8835",
  measurementId: "G-3J8N0WL44G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let userId = null;

// Define lock times for the bets
const lockTimeGroup1 = new Date("February 15, 2025 13:40:00"); // 1:40 PM Games
const lockTimeGroup2 = new Date("February 15, 2025 15:00:00"); // 3:00 PM Games
const lockTimeGroup3 = new Date("February 15, 2025 16:20:00"); // 4:20 PM Games


let selectedGameTitle = "Game 1"; // Default game title

const gameTitles = {
  game1: "Game 1",
  game2: "Game 2",
  game3: "Game 3",
  game4: "Game 4"
};

window.onload = function () {
  // Set the first button as active when the page loads
  const firstButton = document.querySelector(".game-toggle button");
  if (firstButton) {
    firstButton.classList.add("active");
  }

  console.log("Default selected game:", selectedGameTitle);
};

// Update user's balance display
async function loadUserBalance() {
  if (!userId) return;
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    document.getElementById("balance").textContent = `$${userSnap.data().balance}`;
  }
}

const betCategories = [
  {
    category: "Moneyline",
    options: [
      { id: "option1", name: "Colorado", odds: 1.25, lockTime: lockTimeGroup1, game: "game1" },
      { id: "option2", name: "Stanford", odds: 5, lockTime: lockTimeGroup1, game: "game1" },
    ],
  },
  {
    category: "Spread",
    options: [
      { id: "option3", name: "Colorado -3.5", odds: 1.8, lockTime: lockTimeGroup1, game: "game1" },
      { id: "option4", name: "Stanford +3.5", odds: 2.25, lockTime: lockTimeGroup1, game: "game1" },
    ],
  },
  {
    category: "Moneyline",
    options: [
      { id: "option7", name: "Oregon State", odds: 1.44, lockTime: lockTimeGroup1, game: "game2" },
      { id: "option8", name: "California", odds: 3.25, lockTime: lockTimeGroup1, game: "game2" },
    ],
  },
  {
    category: "Spread",
    options: [
      { id: "option9", name: "Oregon State -1.5", odds: 2.35, lockTime: lockTimeGroup1, game: "game2" },
      { id: "option10", name: "California +1.5", odds: 1.74, lockTime: lockTimeGroup1, game: "game2" },
    ],
  },
  {
    category: "Hammers",
    options: [
      { id: "option11", name: "Over 2.5", odds: 2, lockTime: lockTimeGroup1, game: "game2" },
      { id: "option12", name: "Under 2.5", odds: 2, lockTime: lockTimeGroup1, game: "game2" },
    ],
  },
  {
    category: "Moneyline",
    options: [
      { id: "option13", name: "Western Washington", odds: 1.25, lockTime: lockTimeGroup2, game: "game3" },
      { id: "option14", name: "UC Santa Cruz", odds: 5, lockTime: lockTimeGroup2, game: "game3" },
    ],
  },
  {
    category: "Spread",
    options: [
      { id: "option15", name: "Western Washington -3.5", odds: 1.8, lockTime: lockTimeGroup2, game: "game3" },
      { id: "option16", name: "UC Santa Cruz +3.5", odds: 2.25, lockTime: lockTimeGroup2, game: "game3" },
    ],
  },
  {
    category: "Moneyline",
    options: [
      { id: "option17", name: "Northeastern", odds: 1.25, lockTime: lockTimeGroup2, game: "game4" },
      { id: "option18", name: "UC San Diego", odds: 5, lockTime: lockTimeGroup2, game: "game4" },
    ],
  },
  {
    category: "Spread",
    options: [
      { id: "option19", name: "Northeastern -3.5", odds: 1.8, lockTime: lockTimeGroup2, game: "game4" },
      { id: "option20", name: "UC San Diego +3.5", odds: 2.25, lockTime: lockTimeGroup2, game: "game4" },
    ],
  },
  {
    category: "Moneyline",
    options: [
      { id: "option1", name: "Utah", odds: 1.25, lockTime: lockTimeGroup3, game: "game5" },
      { id: "option2", name: "UC Davis", odds: 5, lockTime: lockTimeGroup3, game: "game5" },
    ],
  },
  {
    category: "Spread",
    options: [
      { id: "option3", name: "Utah -3.5", odds: 1.8, lockTime: lockTimeGroup3, game: "game5" },
      { id: "option4", name: "UC Davis +3.5", odds: 2.25, lockTime: lockTimeGroup3, game: "game5" },
    ],
  },
  {
    category: "Moneyline",
    options: [
      { id: "option1", name: "Oregon", odds: 1.25, lockTime: lockTimeGroup3, game: "game6" },
      { id: "option2", name: "Northeastern", odds: 5, lockTime: lockTimeGroup3, game: "game6" },
    ],
  },
  {
    category: "Spread",
    options: [
      { id: "option3", name: "Oregon -3.5", odds: 1.8, lockTime: lockTimeGroup3, game: "game6" },
      { id: "option4", name: "Northeastern +3.5", odds: 2.25, lockTime: lockTimeGroup3, game: "game6" },
    ],
  },
];

function convertToAmericanOdds(decimalOdds) {
  if (decimalOdds >= 2.00) {
    return `+${Math.round((decimalOdds - 1) * 100)}`;
  } else {
    return `${Math.round(-100 / (decimalOdds - 1))}`;
  }
}

function setLockTime(lockTime) {
  console.log(lockTime);
  const lockTimeElement = document.getElementById("lock-time");
  lockTimeElement.textContent = new Date(lockTime).toLocaleString();
}

// Create a category card
function createCategoryCard(category) {
  const card = document.createElement("div");
  card.className = "bet-card";

  const now = new Date();
  const isLocked = now >= category.options[0].lockTime; // Check lock status for the first option

  setLockTime(category.options[0].lockTime);

  let optionsHTML = "";
  category.options.forEach(option => {
    optionsHTML += `
      <label>
        <input type="radio" name="${category.category}" value="${option.id}" data-odds="${option.odds}" ${isLocked ? "disabled" : ""}>
        ${option.name} (${convertToAmericanOdds(option.odds)})
      </label>
    `;
  });

  card.innerHTML = `
    <h3>${category.category}</h3>
    ${optionsHTML}
    <input type="number" id="betAmount_${category.category}" placeholder="Bet Amount" min="1" max="40" ${isLocked ? "disabled" : ""}>
    <button id="placeBet${category.category}" onclick="placeBet('${category.category}')" ${isLocked ? "disabled" : ""}>Place Bet</button>
    ${isLocked ? `<p style="color: red; font-weight: bold;">Bet locked</p>` : ""}
  `;

  // Add event listeners for input changes
  const betAmountInput = card.querySelector(`#betAmount_${category.category}`);
  const placeBet = card.querySelector(`#placeBet${category.category}`);
  const radioButtons = card.querySelectorAll(`input[name="${category.category}"]`);

  function updateWinnings() {
    const selectedOption = card.querySelector(`input[name="${category.category}"]:checked`);
    if (selectedOption && betAmountInput.value) {
      const odds = parseFloat(selectedOption.dataset.odds);
      const betAmount = parseFloat(betAmountInput.value);
      const potentialWinnings = betAmount * odds;
      placeBet.textContent = `Place Bet (Payout: $${potentialWinnings.toFixed(2)})`;
    } else {
      placeBet.textContent = "Place Bet";
    }
  }

  betAmountInput.addEventListener("input", updateWinnings);
  radioButtons.forEach(radio => radio.addEventListener("change", updateWinnings));

  return card;
}


// Render category-based bet cards
function renderBetCards(game) {
  const container = document.getElementById("betContainer");
  container.innerHTML = "";
  betCategories
    .filter(category => category.options.some(option => option.game === game))
    .forEach(category => {
      const card = createCategoryCard(category);
      container.appendChild(card);
    });
}

// Modified placeBet function
async function placeBet(categoryName) {
  if (!userId) {
    alert("User not authenticated.");
    return;
  }

  const selectedOption = document.querySelector(`input[name="${categoryName}"]:checked`);
  if (!selectedOption) {
    alert("Please select an option.");
    return;
  }

  const optionId = selectedOption.value;
  const betAmountInput = document.getElementById(`betAmount_${categoryName}`);
  const betAmount = parseFloat(betAmountInput.value);
  const currentGame = selectedGameTitle

  if (isNaN(betAmount) || betAmount <= 0 || betAmount > 40) {
    alert("Please enter a valid bet amount (max $40).");
    return;
  }

  // Fetch user balance and ensure sufficient funds
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists() || userSnap.data().balance < betAmount) {
    alert("Insufficient balance.");
    return;
  }

  // Prevent duplicate bets on the same option
  const betDocId = `${userId}_${optionId}`;
  const betDocRef = doc(collection(db, "bets"), betDocId);
  const existingBetSnap = await getDoc(betDocRef);
  if (existingBetSnap.exists()) {
    alert("You already placed a bet in this category.");
    return;
  }

  // Deduct the bet amount from the user's balance
  await updateDoc(userRef, { balance: userSnap.data().balance - betAmount });

  // Record the bet in Firestore
  await setDoc(betDocRef, {
    userId: userId,
    amount: betAmount,
    choice: optionId,
    odds: betCategories.find(cat => cat.options.some(opt => opt.id === optionId)).options.find(opt => opt.id === optionId).odds,
    status: "pending",
    game: currentGame,
  });

  alert(`Bet placed on "${selectedOption.nextSibling.textContent.trim()}" for $${betAmount}!`);
  loadUserBalance();
}

// Listen for authentication changes
onAuthStateChanged(auth, user => {
  if (user) {
    userId = user.uid;
    loadUserBalance();
    renderBetCards("game1");
  } else {
    alert("You must be signed in.");
    window.location.href = "index.html";
  }
});


window.placeBet = placeBet;

window.switchGame = function(game) {
    const buttons = document.querySelectorAll(".game-toggle button");
    buttons.forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");
  
    // Store the selected game title
    selectedGameTitle = gameTitles[game] || "Unknown Game"; 
    console.log("Selected game:", selectedGameTitle); // Debugging
  
    // Call a function to load bets based on the selected game
    renderBetCards(game);
  };

window.userPage = function() {
  window.location.href=`user.html?userId=${encodeURIComponent(userId)}`;
}