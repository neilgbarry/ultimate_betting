import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';

// Firebase Configuration
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
const analytics = getAnalytics(app);
const db = getFirestore(app);  // ✅ FIXED: Correct Firestore Initialization
const auth = getAuth(app);

// Sign in
window.signIn = function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            window.location.href = "dashboard.html";
        })
        .catch(error => alert(error.message));
};

// Sign up and create user balance
window.signUp = function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
        const user = userCredential.user;
        return setDoc(doc(db, "users", user.uid), {
            email: user.email,
            balance: 100  // ✅ FIXED: Using setDoc to initialize balance
        });
    })
    .then(() => {
        window.location.href = "dashboard.html"; // Redirect to dashboard
    })
    .catch(error => alert(error.message));
};

// Sign out
window.signOut = function() {
    signOut(auth).then(() => {
        document.getElementById("user-info").textContent = "Signed out";
    });
};

// Check user balance
function checkUserBalance(uid) {
    const balanceRef = doc(db, "users", uid);

    getDoc(balanceRef).then(docSnap => {
        if (docSnap.exists()) {
            document.getElementById("balance").textContent = `Balance: $${docSnap.data().balance}`;
        } else {
            setDoc(balanceRef, { balance: 100 }); // Default balance if user is new
            document.getElementById("balance").textContent = "Balance: $100";
        }
    });
}

// Detect auth state change
onAuthStateChanged(auth, user => {
    if (user) {
        document.getElementById("user-info").textContent = `Logged in as ${user.email}`;
    } else {
        document.getElementById("user-info").textContent = "Not signed in";
    }
});