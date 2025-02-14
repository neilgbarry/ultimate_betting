import { getFirestore, doc, setDoc, getDoc, collection } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js'
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js'
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js'

// Firebase Configuration (Same as before)
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
const db = getFirestore(app);
const auth = getAuth(app);


// Load user balance
auth.onAuthStateChanged(user => {
    if (user) {
		const userDocRef = doc(db, "users", user.uid);
		getDoc(userDocRef)
		.then(docSnap => {
			if (docSnap.exists()) {
				document.getElementById("balance").textContent = docSnap.data().balance;
			} else {
				document.getElementById("balance").textContent = "Error: No balance found";
			}
		})
		.catch(error => console.error("Error fetching balance:", error));
    } else {
        //window.location.href = "index.html"; // Redirect if not signed in
    }
});

// Sign out
window.signOut = function() {
	console.log("SISGS+D")
    auth.signOut().then(() => {
        window.location.href = "index.html";
    });
};
