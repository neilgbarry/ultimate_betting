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
const lockTimeGroup1 = new Date("February 15, 2025 15:00:00"); // 3:00 PM for first two options
const lockTimeGroup2 = new Date("February 15, 2025 17:00:00"); // 5:00 PM for last three options

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
    category: "Winner",
    options: [
      { id: "option1", name: "Team A Wins", odds: 1.8, lockTime: lockTimeGroup1, game: "game1" },
      { id: "option2", name: "Team B Wins", odds: 2.1, lockTime: lockTimeGroup1, game: "game1" },
    ],
  },
  {
    category: "Over/Under",
    options: [
      { id: "option3", name: "Over 2.5 Goals", odds: 1.9, lockTime: lockTimeGroup1, game: "game1" },
      { id: "option4", name: "Under 2.5 Goals", odds: 1.7, lockTime: lockTimeGroup1, game: "game1" },
    ],
  },
  {
    category: "Hammers Over/Under",
    options: [
      { id: "option5", name: "Over 2.5 Hammers", odds: 1.9, lockTime: lockTimeGroup1, game: "game1" },
      { id: "option6", name: "Under 2.5 Gammers", odds: 1.7, lockTime: lockTimeGroup1, game: "game1" },
    ],
  },
  {
    category: "Winner",
    options: [
      { id: "option7", name: "Team A Wins", odds: 1.8, lockTime: lockTimeGroup2, game: "game2" },
      { id: "option8", name: "Team B Wins", odds: 2.1, lockTime: lockTimeGroup2, game: "game2" },
    ],
  },
  {
    category: "Over/Under",
    options: [
      { id: "option9", name: "Over 2.5 Goals", odds: 1.9, lockTime: lockTimeGroup2, game: "game2" },
      { id: "option10", name: "Under 2.5 Goals", odds: 1.7, lockTime: lockTimeGroup2, game: "game2" },
    ],
  },
  {
    category: "Hammers Over/Under",
    options: [
      { id: "option11", name: "Over 2.5 Hammers", odds: 1.9, lockTime: lockTimeGroup2, game: "game2" },
      { id: "option12", name: "Under 2.5 Gammers", odds: 1.7, lockTime: lockTimeGroup2, game: "game2" },
    ],
  },
];

// Create a category card
function createCategoryCard(category) {
  const card = document.createElement("div");
  card.className = "bet-card";

  const now = new Date();
  const isLocked = now >= category.options[0].lockTime; // Check lock status for the first option

  let optionsHTML = "";
  category.options.forEach(option => {
    optionsHTML += `
      <label>
        <input type="radio" name="${category.category}" value="${option.id}" ${isLocked ? "disabled" : ""}>
        ${option.name} (Odds: ${option.odds})
      </label><br>
    `;
  });

  card.innerHTML = `
    <h3>${category.category}</h3>
    <p>Bet Lock Time: ${category.options[0].lockTime.toLocaleString()}</p>
    ${optionsHTML}
    <label for="betAmount_${category.category}">Bet Amount ($):</label>
    <input type="number" id="betAmount_${category.category}" placeholder="Max $40" min="1" max="40" ${isLocked ? "disabled" : ""}>
    <button onclick="placeBet('${category.category}')" ${isLocked ? "disabled" : ""}>Place Bet</button>
    ${isLocked ? `<p style="color: red; font-weight: bold;">Bet locked</p>` : ""}
  `;

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

	// Call a function to load bets based on the selected game
	renderBetCards(game);
  }