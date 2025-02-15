import { 
	getFirestore, collection, query, where, getDocs, updateDoc, doc, getDoc 
  } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';
  import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js';
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js'

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
  const db = getFirestore();
  const auth = getAuth();
  
  // Define available betting options (example data)
  const betOptions = [
	{ id: 'option1', name: 'Team A Wins', odds: 1.8 },
	{ id: 'option2', name: 'Team B Wins', odds: 2.1 },
	{ id: 'option3', name: 'Draw', odds: 3.0 },
	{ id: 'option4', name: 'Over 2.5 Goals', odds: 1.9 },
	{ id: 'option5', name: 'Under 2.5 Goals', odds: 1.7 },
  ];
  
  // Render a card for each betting option
  async function renderOptionCards() {
	const betsRef = collection(db, "bets");
	const allBets = await getDocs(betsRef);

	let categories = [];
	allBets.forEach(doc => {
		if ((doc.data().status === "pending") && 
			(!categories.some(category => category.name === doc.data().game + " - " + doc.data().description))) {
			// Push the bet to categories only if it doesn't exist
			categories.push({name: doc.data().game + " - " +doc.data().description,
				odds: doc.data().odds,
				desc: doc.data().description
			});
		  }	})
	console.log(categories);

	const container = document.getElementById("optionsContainer");
	container.innerHTML = "";

	categories.forEach(category => {
		const card = document.createElement("div");
		card.className = "option-card";
		card.innerHTML = `
		  <h3>${category.name}</h3>
		  <p>Odds: ${category.odds}</p>
		  <label>
			<input type="radio" name="settle_${category.name}" value="yes"> Yes
		  </label>
		  <label>
			<input type="radio" name="settle_${category.name}" value="no" checked> No
		  </label>
		  <br>
		  <button onclick="settleOption('${category.name}')">Settle ${category.desc}</button>
		`;
		container.appendChild(card);
	})
  }
  
  // Settle all pending bets for a given option
  window.settleOption = async function(optionId) {
	const statusDiv = document.getElementById("status");
	statusDiv.textContent = "Processing, please wait...";
  
	// Determine admin selection for this option (yes = pay out, no = mark as lost)
	const radios = document.getElementsByName(`settle_${optionId}`);
	let settleAsWinner = false;
	for (let radio of radios) {
	  if (radio.checked && radio.value === "yes") {
		settleAsWinner = true;
		break;
	  }
	}
	
	// Query all pending bets for this option
	const betsRef = collection(db, "bets");
	const q = query(betsRef, where("gameDescription", "==", optionId), where("status", "==", "pending"));
	const querySnapshot = await getDocs(q);
	let processedCount = 0;
	
	for (const betDoc of querySnapshot.docs) {
	  const betData = betDoc.data();
	  const betDocRef = doc(db, "bets", betDoc.id);
	  
	  if (settleAsWinner) {
		// For winning bets, update the user's balance
		const userRef = doc(db, "users", betData.userId);
		const userSnap = await getDoc(userRef);
		if (userSnap.exists()) {
		  const currentBalance = userSnap.data().balance || 0;
		  const payout = betData.amount * betData.odds;
		  await updateDoc(userRef, { balance: currentBalance + payout });
		}
		// Mark bet as won
		await updateDoc(betDocRef, { status: "won" });
	  } else {
		// Mark bet as lost
		await updateDoc(betDocRef, { status: "lost" });
	  }
	  
	  processedCount++;
	}
	
	statusDiv.textContent = `Processed ${processedCount} bets for option ${optionId}.`;
  };
  
  // Simple admin check and initialize the page
  onAuthStateChanged(auth, user => {
	if (user) {
	  // Replace with your actual admin email
	  if (user.email !== "admin@a.com") {
		alert("Access denied. You must be an admin.");
		window.location.href = "index.html";
	  } else {
		renderOptionCards();
	  }
	} else {
	  alert("You must be signed in.");
	  window.location.href = "index.html";
	}
  });
  