import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js';

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
const auth = getAuth(app);
const db = getFirestore(app);
let authuserId = null;
const now = new Date();

// Get the userId from the URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');

if (!userId) {
    console.error("No userId parameter found in the URL");
}

// Fetch user profile using userId
async function fetchUserProfile(userId) {
    const userDocRef = doc(db, "users", userId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
        const userData = userSnap.data();
        const username = userData.username;
        const balance = userData.balance || 0;

        // Fetch the user's bet history
        const betsRef = collection(db, "bets");
        const betsSnap = await getDocs(betsRef);

        let betHistory = [];
        betsSnap.forEach(betDoc => {
            const bet = betDoc.data();

            const gameLockTime = {
                "COL vs. STANF": new Date("February 15, 2025 13:40:00"),
                "OSU vs. CAL": new Date("February 15, 2025 13:40:00"),
                "WWU vs. UCSC": new Date("February 15, 2025 15:00:00"),
                "NEU vs. UCSD": new Date("February 15, 2025 15:00:00"),
                "UTAH vs. UCD": new Date("February 15, 2025 16:20:00"),
                "ORE vs. NEU": new Date("February 15, 2025 16:20:00"),
            }[bet.game]
            const isLocked = gameLockTime && now >= gameLockTime;
        
            // If viewing another user's page, only show locked bets
            if (bet.userId === userId && (userId === authuserId || isLocked || authuserId === "wOCrlBfyH9dcdNgcDOwLsODBmMQ2")) {
                betHistory.push({ 
                    amount: bet.amount, 
                    status: bet.status, 
                    payout: bet.amount * bet.odds,
                    game: bet.game,
                    betname: bet.description
                });
            }
        });

        return { username, balance, betHistory };
    } else {
        return null;
    }
}

async function displayUserProfile() {
    const profileContainer = document.getElementById("profile");
    profileContainer.innerHTML = "<p>Loading profile...</p>";

    const userProfile = await fetchUserProfile(userId);
    if (userProfile) {
        profileContainer.innerHTML = `
        <h2>${userProfile.username}'s Bet History</h2>
        <p>Balance: $${userProfile.balance.toFixed(2)}</p>
        <h3>Bet History</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th>Game</th>
                    <th>Bet</th>
                    <th>Amount</th>
                    <th>Payout</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${userProfile.betHistory.map(bet => `
                    <tr>
                        <td>${bet.game ? bet.game : "Unknown Game"}</td>
                        <td>${bet.betname}</td>
                        <td>$${bet.amount.toFixed(2)}</td>
                        <td>$${bet.payout.toFixed(2)}</td>
                        <td>${bet.status}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;  
    } else {
        profileContainer.innerHTML = "<p>User not found</p>";
    }
}

document.addEventListener("DOMContentLoaded", displayUserProfile);

// Listen for authentication changes
onAuthStateChanged(auth, user => {
  if (user) {
    authuserId = user.uid;
  } else {
    authuserId = null;
  }
});

const lastVisited = localStorage.getItem('lastVisited');
if (lastVisited.includes("bets")) {
    const leButton = document.getElementById("leaderboard-button");
    leButton.innerText = "Back to Dashboard";
    leButton.href = lastVisited;
}
localStorage.setItem('lastVisited', null)
