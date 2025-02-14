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
let userAdmin = false;

// Define lock times for the bets
const lockTimeGroup1 = new Date("February 15, 2025 13:40:00"); // 1:40 PM Games
const lockTimeGroup2 = new Date("February 15, 2025 15:00:00"); // 3:00 PM Games
const lockTimeGroup3 = new Date("February 15, 2025 16:20:00"); // 4:20 PM Games



const gameTitles = {
  game1: "COL vs. STANF (W)",
  game2: "OSU vs. CAL (M)",
  game3: "WWU vs. UCSC (W)",
  game4: "NEU vs. UCSD (M)",
  game5: "UTAH vs. UCD (W)",
  game6: "ORE vs. NEU (M)"
};

let selectedGameTitle = gameTitles["game1"]; // Default game title

window.onload = function () {
  // Set the first button as active when the page loads
  const firstButton = document.querySelector(".game-toggle button");
  if (firstButton) {
    firstButton.classList.add("active");
  }

};

// Update user's balance display
async function loadUserBalance() {
  if (!userId) return;
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    document.getElementById("balance").textContent = `$${userSnap.data().balance.toFixed(2)}`;
  }
}

const betCategories = [
  {
    category: "Moneyline",
    options: [
      { name: "Colorado", description: "Colorado ML", odds: 1.25, lockTime: lockTimeGroup1, game: "game1" },
      { name: "Stanford", description: "Stanford ML", odds: 5, lockTime: lockTimeGroup1, game: "game1" },
    ],
  },
  {
    category: "Spread",
    options: [
      { name: "Colorado -3.5", description: "Colorado -3.5", odds: 1.8, lockTime: lockTimeGroup1, game: "game1" },
      { name: "Stanford +3.5", description: "Stanford +3.5", odds: 2.25, lockTime: lockTimeGroup1, game: "game1" },
    ],
  },
  {
    category: "Moneyline",
    options: [
      { name: "Oregon State", description: "Oregon State ML", odds: 1.47, lockTime: lockTimeGroup1, game: "game2" },
      { name: "California", description: "California ML", odds: 3.2, lockTime: lockTimeGroup1, game: "game2" },
    ],
  },
  {
    category: "Spread",
    options: [
      { name: "Oregon State -1.5", description: "Oregon State -1.5", odds: 2.35, lockTime: lockTimeGroup1, game: "game2" },
      { name: "California +1.5", description: "California +1.5", odds: 1.74, lockTime: lockTimeGroup1, game: "game2" },
    ],
  },
  {
    category: "Alternate_Line",
    options: [
      { name: "Oregon State -4.5", description: "Oregon State -4.5", odds: 4.5, lockTime: lockTimeGroup1, game: "game2" },
      { name: "California -2.5", description: "California -2.5", odds: 4.5, lockTime: lockTimeGroup1, game: "game2" },
    ],
  },
  {
    category: "Hammers",
    options: [
      { name: "Over 2.5", description: "Over 2.5 Hammers", odds: 2, lockTime: lockTimeGroup1, game: "game2" },
      { name: "Under 2.5", description: "Under 2.5 Hammers", odds: 2, lockTime: lockTimeGroup1, game: "game2" },
    ],
  },
  {
    category: "Breaks_-_Total",
    options: [
      { name: "Over 4.5", description: "Over 4.5 Breaks", odds: 2.3, lockTime: lockTimeGroup1, game: "game2" },
      { name: "Under 4.5", description: "Under 4.5 Breaks", odds: 1.77, lockTime: lockTimeGroup1, game: "game2" },
    ],
  },
  {
    category: "Moneyline",
    options: [
      { name: "Western Washington", description: "Western Washington ML", odds: 2.5, lockTime: lockTimeGroup2, game: "game3" },
      { name: "UC Santa Cruz", description: "UC Santa Cruz ML", odds: 1.67, lockTime: lockTimeGroup2, game: "game3" },
    ],
  },
  {
    category: "Spread",
    options: [
      { name: "Western Washington +1.5", description: "Western Washington +1.5", odds: 1.74, lockTime: lockTimeGroup2, game: "game3" },
      { name: "UC Santa Cruz -1.5", description: "UC Santa Cruz -1.5", odds: 2.35, lockTime: lockTimeGroup2, game: "game3" },
    ],
  },
  {
    category: "Moneyline",
    options: [
      { name: "Northeastern", description: "Northeastern ML", odds: 1.57, lockTime: lockTimeGroup2, game: "game4" },
      { name: "UC San Diego", description: "UC San Diego ML", odds: 2.75, lockTime: lockTimeGroup2, game: "game4" },
    ],
  },
  {
    category: "Spread",
    options: [
      { name: "Northeastern -1.5", description: "Northeastern -1.5", odds: 2.1, lockTime: lockTimeGroup2, game: "game4" },
      { name: "UC San Diego +1.5", description: "UC San Diego +1.5", odds: 1.91, lockTime: lockTimeGroup2, game: "game4" },
    ],
  },
  {
    category: "OB_Pulls_Total",
    options: [
      { name: "Over 5.5", description: "Over 5.5 OB Pulls", odds: 2.3, lockTime: lockTimeGroup2, game: "game4" },
      { name: "Under 5.5", description: "Under 5.5 OB Pulls", odds: 1.77, lockTime: lockTimeGroup2, game: "game4" },
    ],
  },
  {
    category: "Moneyline",
    options: [
      { name: "Utah", description: "Utah ML", odds: 1.69, lockTime: lockTimeGroup3, game: "game5" },
      { name: "UC Davis", description: "UC Davis ML", odds: 2.45, lockTime: lockTimeGroup3, game: "game5" },
    ],
  },
  {
    category: "Spread",
    options: [
      { name: "Utah -1.5", description: "Utah -1.5", odds: 2.25, lockTime: lockTimeGroup3, game: "game5" },
      { name: "UC Davis +1.5", description: "UC Davis +1.5", odds: 1.8, lockTime: lockTimeGroup3, game: "game5" },
    ],
  },
  {
    category: "Moneyline",
    options: [
      { name: "Oregon", description: "Oregon ML", odds: 1.36, lockTime: lockTimeGroup3, game: "game6" },
      { name: "Northeastern", description: "Northeastern ML", odds: 3.75, lockTime: lockTimeGroup3, game: "game6" },
    ],
  },
  {
    category: "Spread",
    options: [
      { id: "option3", name: "Oregon -3.5", description: "Oregon -2.5", odds: 1.95, lockTime: lockTimeGroup3, game: "game6" },
      { id: "option4", name: "Northeastern +3.5", description: "Northeastern +2.5", odds: 2.05, lockTime: lockTimeGroup3, game: "game6" },
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
        <input type="radio" name="${category.category}" value="${category.category}" data-description="${option.description}" data-odds="${option.odds}" ${isLocked ? "disabled" : ""}>
        ${option.name} (${convertToAmericanOdds(option.odds)})
      </label>
    `;
  });

  card.innerHTML = `
    <h3>${category.category.split('_').join(' ')}</h3>
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
  console.log(category.category, betAmountInput);
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
  const betDocId = `${userId}_${currentGame}_${optionId}`;
  const betDocRef = doc(collection(db, "bets"), betDocId);
  const existingBetSnap = await getDoc(betDocRef);
  if (existingBetSnap.exists()) {
    alert("You already placed a bet in this category.");
    return;
  }

  // Deduct the bet amount from the user's balance
  await updateDoc(userRef, { balance: userSnap.data().balance - betAmount });

  console.log(selectedOption);
  // Record the bet in Firestore
  await setDoc(betDocRef, {
    userId: userId,
    amount: betAmount,
    description: selectedOption.dataset.description,
    odds: parseFloat(selectedOption.dataset.odds),
    status: "pending",
    game: currentGame,
    gameDescription: currentGame + " - " + selectedOption.dataset.description
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
    if (user.uid === "wOCrlBfyH9dcdNgcDOwLsODBmMQ2") {
      const upcomingGames = {
        "game1": new Date("February 15, 2025 13:40:00"),
        "game2": new Date("February 15, 2025 13:40:00"),
        "game3": new Date("February 15, 2025 15:00:00"),
        "game4": new Date("February 15, 2025 15:00:00"),
        "game5": new Date("February 15, 2025 16:20:00"),
        "game6": new Date("February 15, 2025 16:20:00"),
      };
      const gameToggleDiv = document.querySelector(".game-toggle");
      gameToggleDiv.innerHTML = Object.entries(upcomingGames)
        .map(([game, _], index) => 
          `<button class="${index === 0 ? 'active' : ''}" onclick="switchGame('${game}')">${gameTitles[game]}</button>`
        )
        .join("");
    }
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
  localStorage.setItem('lastVisited', window.location.href);  // Save current URL
  window.location.href=`user.html?userId=${encodeURIComponent(userId)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const gameLockTimes = {
    "game1": new Date("February 15, 2025 13:40:00"),
    "game2": new Date("February 15, 2025 13:40:00"),
    "game3": new Date("February 15, 2025 15:00:00"),
    "game4": new Date("February 15, 2025 15:00:00"),
    "game5": new Date("February 15, 2025 16:20:00"),
    "game6": new Date("February 15, 2025 16:20:00"),
  };

  const now = new Date();

  // Filter games that have a lock time in the future
  let upcomingGames = Object.entries(gameLockTimes)
    .filter(([_, lockTime]) => new Date(lockTime) > now)
    .slice(0, 2); // Only take the first 2 games

  // Generate the filtered game buttons
  const gameToggleDiv = document.querySelector(".game-toggle");
  gameToggleDiv.innerHTML = upcomingGames
    .map(([game, _], index) => 
      `<button class="${index === 0 ? 'active' : ''}" onclick="switchGame('${game}')">${gameTitles[game]}</button>`
    )
    .join("");

  // Set default game to the first available
  if (upcomingGames.length > 0) {
    switchGame(upcomingGames[0][0]);
  }
});
