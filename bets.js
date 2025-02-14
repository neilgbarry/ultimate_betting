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

// Define 5 example betting options with odds and their respective lock times
const betOptions = [
  { id: 'option1', name: 'Team A Wins', odds: 1.8, lockTime: lockTimeGroup1 },
  { id: 'option2', name: 'Team B Wins', odds: 2.1, lockTime: lockTimeGroup1 },
  { id: 'option3', name: 'Draw', odds: 3.0, lockTime: lockTimeGroup2 },
  { id: 'option4', name: 'Over 2.5 Goals', odds: 1.9, lockTime: lockTimeGroup2 },
  { id: 'option5', name: 'Under 2.5 Goals', odds: 1.7, lockTime: lockTimeGroup2 },
];

// Update user's balance display
async function loadUserBalance() {
  if (!userId) return;
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    document.getElementById("balance").textContent = `$${userSnap.data().balance}`;
  }
}

// Create a betting card for each option with lock-time logic
function createBetCard(option) {
  const card = document.createElement("div");
  card.className = "bet-card";
  
  const now = new Date();
  const isLocked = now >= option.lockTime;
  const lockTimeString = option.lockTime.toLocaleString();

  card.innerHTML = `
    <h3>${option.name}</h3>
    <p>Odds: ${option.odds}</p>
    <p>Bet Lock Time: ${lockTimeString}</p>
    <label for="betAmount_${option.id}">Bet Amount ($):</label>
    <input type="number" id="betAmount_${option.id}" placeholder="Max $40" min="1" max="40" ${isLocked ? "disabled" : ""}>
    <button ${isLocked ? "disabled" : ""}>Place Bet</button>
    ${isLocked ? `<p style="color: red; font-weight: bold;">Bet locked</p>` : ""}
  `;

  if (!isLocked) {
    const button = card.querySelector("button");
    button.addEventListener("click", () => placeBet(option));
  }
  
  return card;
}

// Render all betting cards
function renderBetCards() {
  const container = document.getElementById("betContainer");
  container.innerHTML = "";
  betOptions.forEach(option => {
    const card = createBetCard(option);
    container.appendChild(card);
  });
}

// Place a bet for a selected option
async function placeBet(option) {
  // Check lock time before proceeding
  if (new Date() >= option.lockTime) {
    alert("Bets on this option are locked.");
    return;
  }
  
  const betInput = document.getElementById(`betAmount_${option.id}`);
  const betAmount = parseFloat(betInput.value);
  
  if (isNaN(betAmount) || betAmount <= 0 || betAmount > 40) {
    alert("Please enter a valid bet amount (max $40).");
    return;
  }
  
  if (!userId) {
    alert("User not authenticated.");
    return;
  }
  
  // Fetch user balance and ensure sufficient funds
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists() || userSnap.data().balance < betAmount) {
    alert("Insufficient balance.");
    return;
  }
  
  // Prevent duplicate bets on the same option using a composite ID
  const betDocId = `${userId}_${option.id}`;
  const betDocRef = doc(collection(db, "bets"), betDocId);
  const existingBetSnap = await getDoc(betDocRef);
  if (existingBetSnap.exists()) {
    alert("You already placed a bet on this option.");
    return;
  }
  
  // Deduct the bet amount from the user's balance
  await updateDoc(userRef, { balance: userSnap.data().balance - betAmount });
  
  // Record the bet in Firestore
  await setDoc(betDocRef, {
    userId: userId,
    amount: betAmount,
    choice: option.id,
    odds: option.odds,
    status: "pending"
  });
  
  alert(`Bet placed on "${option.name}" for $${betAmount}!`);
  loadUserBalance();
}

// Listen for authentication changes
onAuthStateChanged(auth, user => {
  if (user) {
    userId = user.uid;
    loadUserBalance();
    renderBetCards();
  } else {
    alert("You must be signed in.");
    window.location.href = "index.html";
  }
});
