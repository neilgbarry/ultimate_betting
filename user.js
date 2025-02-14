import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';
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
            console.log(bet)
            if (bet.userId === userId) {
                betHistory.push({ 
                    amount: bet.amount, 
                    status: bet.status, 
                    odds: bet.odds
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
            <ul>
                ${userProfile.betHistory.map(bet => `
                    <li><strong>$${bet.amount.toFixed(2)}</strong> - ${bet.status} - ${bet.odds}</li>
                `).join('')}
            </ul>
        `;
    } else {
        profileContainer.innerHTML = "<p>User not found</p>";
    }
}

document.addEventListener("DOMContentLoaded", displayUserProfile);
