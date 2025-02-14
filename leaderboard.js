import { getFirestore, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';
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

// Fetch all users and their balances
async function fetchUsers() {
    const usersRef = collection(db, "users");
    const usersSnap = await getDocs(usersRef);
    let users = [];

    for (const userDoc of usersSnap.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
		const username = userData.username;
        const balance = userData.balance || 0;

        // Fetch pending bets for the user
        const betsRef = collection(db, "bets");
        const betsQuery = query(betsRef, where("userId", "==", userId), where("status", "==", "pending"));
        const betsSnap = await getDocs(betsQuery);

        let pendingBetsTotal = 0;
        betsSnap.forEach(betDoc => {
            pendingBetsTotal += betDoc.data().amount;
        });

        const totalValue = balance + pendingBetsTotal;
		if (username != "Admin") {
        users.push({ username, balance, pendingBetsTotal, totalValue });
		}
    }

    return users;
}

// Display leaderboard
async function displayLeaderboard() {
    const leaderboardContainer = document.getElementById("leaderboard");
    leaderboardContainer.innerHTML = "<p>Loading...</p>";

    const users = await fetchUsers();
    users.sort((a, b) => b.totalValue - a.totalValue);
    leaderboardContainer.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Balance ($)</th>
                    <th>Pending Bets ($)</th>
                    <th>Total ($)</th>
                </tr>
            </thead>
            <tbody>
                ${users.map((user, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${user.username}</td>
                        <td>${user.balance.toFixed(2)}</td>
                        <td>${user.pendingBetsTotal.toFixed(2)}</td>
                        <td><strong>${user.totalValue.toFixed(2)}</strong></td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

document.addEventListener("DOMContentLoaded", displayLeaderboard);