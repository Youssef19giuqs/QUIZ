// ========================================
// PARTIE 1: LES QUESTIONS DU QUIZ
// ========================================
const questions = [
  {
    id: 1,
    niveau: 1,
    question: "Quelle planète est la plus proche du Soleil ?",
    reponses: ["Mercure", "Vénus", "Terre", "Mars"],
    bonneReponse: 0
  },
  {
    id: 2,
    niveau: 1,
    question: "Combien de planètes y a-t-il dans notre système solaire ?",
    reponses: ["7", "8", "9", "10"],
    bonneReponse: 1
  },
  {
    id: 3,
    niveau: 1,
    question: "Quelle est la plus grande planète du système solaire ?",
    reponses: ["Saturne", "Jupiter", "Neptune", "Uranus"],
    bonneReponse: 1
  },
  {
    id: 4,
    niveau: 2,
    question: "Combien de temps la lumière du Soleil met-elle pour atteindre la Terre ?",
    reponses: ["8 secondes", "8 minutes", "8 heures", "8 jours"],
    bonneReponse: 1
  },
  {
    id: 5,
    niveau: 2,
    question: "Quelle planète est surnommée la planète rouge ?",
    reponses: ["Vénus", "Mars", "Jupiter", "Saturne"],
    bonneReponse: 1
  },
  {
    id: 6,
    niveau: 2,
    question: "Quel est le satellite naturel de la Terre ?",
    reponses: ["Mars", "Io", "La Lune", "Titan"],
    bonneReponse: 2
  },
  {
    id: 7,
    niveau: 3,
    question: "Quelle est la vitesse de la lumière dans le vide ?",
    reponses: ["300 km/s", "3000 km/s", "30 000 km/s", "300 000 km/s"],
    bonneReponse: 3
  },
  {
    id: 8,
    niveau: 3,
    question: "Quelle galaxie est la plus proche de la Voie Lactée ?",
    reponses: ["Andromède", "Sombrero", "Centaurus", "Triangulum"],
    bonneReponse: 0
  }
];

// ========================================
// PARTIE 2: LOCALSTORAGE - CLÉS
// ========================================
const AUTH_KEY = 'quiz_spaceship_user';
const USERS_KEY = 'quiz_spaceship_users';
const QUIZ_STATE_KEY = 'quiz_spaceship_state';

// ========================================
// PARTIE 3: GESTION DES UTILISATEURS
// ========================================

// Récupérer tous les utilisateurs depuis localStorage
function getAllUsers() {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
}

// Sauvegarder un nouvel utilisateur dans localStorage
function saveUser(userData) {
  const users = getAllUsers();
  users.push(userData);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Vérifier si un email existe déjà
function emailExists(email) {
  const users = getAllUsers();
  return users.some(user => user.email === email);
}

// Connecter l'utilisateur (sauvegarder dans localStorage)
function loginUser(userData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
}

// Récupérer l'utilisateur connecté depuis localStorage
function getCurrentUser() {
  const user = localStorage.getItem(AUTH_KEY);
  return user ? JSON.parse(user) : null;
}

// Déconnecter l'utilisateur
function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(QUIZ_STATE_KEY);
}

// ========================================
// PARTIE 4: MOT DE PASSE
// ========================================

// Afficher/masquer le mot de passe
function togglePwd() {
  const pwdInput = document.getElementById('password');
  const eyeBtn = document.querySelector('.eye');
  
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    eyeBtn.textContent = '👁️‍🗨️';
  } else {
    pwdInput.type = 'password';
    eyeBtn.textContent = '👁️';
  }
}

// Calculer la force du mot de passe
function checkPasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  return Math.min(strength, 4);
}

// Écouter les changements du mot de passe
const passwordInput = document.getElementById('password');
if (passwordInput) {
  passwordInput.addEventListener('input', (e) => {
    const password = e.target.value;
    const strength = checkPasswordStrength(password);
    const meter = document.getElementById('pwdMeter');
    const hint = document.getElementById('pwdHint');
    
    meter.value = strength;
    
    const labels = ['très faible', 'faible', 'moyen', 'fort', 'très fort'];
    hint.textContent = `Force: ${labels[strength]}`;
  });
}

// ========================================
// PARTIE 5: INSCRIPTION
// ========================================

const signupForm = document.getElementById('signup');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validation
    if (!prenom || !nom || !email || !password) {
      alert('Tous les champs sont obligatoires.');
      return;
    }
    
    if (password.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    
    if (emailExists(email)) {
      alert('Cet email est déjà utilisé.');
      return;
    }
    
    // Créer l'utilisateur
    const userData = {
      id: Date.now().toString(),
      prenom,
      nom,
      email,
      password,
      dateInscription: new Date().toISOString(),
      scores: []
    };
    
    // Sauvegarder dans localStorage
    saveUser(userData);
    loginUser(userData);
    
    alert(`Bienvenue ${prenom} ! Ton compte a été créé avec succès.`);
    
    // Démarrer le quiz
    startQuiz();
    
    e.target.reset();
  });
}

// ========================================
// PARTIE 6: GESTION DU QUIZ
// ========================================

let quizState = {
  questionActuelle: 0,
  score: 0,
  vies: 5,
  reponses: []
};

// Sauvegarder l'état du quiz dans localStorage
function saveQuizState() {
  localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(quizState));
}

// Charger l'état du quiz depuis localStorage
function loadQuizState() {
  const saved = localStorage.getItem(QUIZ_STATE_KEY);
  if (saved) {
    quizState = JSON.parse(saved);
  }
}

// Démarrer le quiz
function startQuiz() {
  const user = getCurrentUser();
  
  if (!user) {
    alert('Vous devez créer un compte pour jouer.');
    document.getElementById('signup').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  
  // Réinitialiser l'état
  quizState = {
    questionActuelle: 0,
    score: 0,
    vies: 5,
    reponses: []
  };
  saveQuizState();
  
  // Cacher les autres sections
  document.getElementById('accueil').style.display = 'none';
  document.querySelector('.section-invasion').style.display = 'none';
  document.querySelector('.section-congrats').style.display = 'none';
  
  // Afficher le quiz
  document.getElementById('quiz').style.display = 'block';
  document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
  
  afficherQuestion();
}

// Afficher une question
function afficherQuestion() {
  const question = questions[quizState.questionActuelle];
  
  // Mettre à jour le compteur
  document.querySelector('.q-count').textContent = `Question ${quizState.questionActuelle + 1}/${questions.length}`;
  
  // Mettre à jour les vies
  const livesDiv = document.querySelector('.lives');
  livesDiv.textContent = '❤'.repeat(quizState.vies);
  
  // Mettre à jour le niveau dans la barre latérale
  document.querySelectorAll('.bar').forEach((bar, index) => {
    bar.classList.remove('active');
    // Ajouter la classe active au niveau actuel
    if (index === question.niveau - 1) {
      bar.classList.add('active');
      bar.style.background = 'linear-gradient(180deg, #7cf, #58a8ff)';
      bar.style.transform = 'scale(1.05)';
      bar.style.boxShadow = '0 0 20px #59aaff88';
    } else {
      bar.style.background = '#140a46';
      bar.style.transform = 'scale(1)';
      bar.style.boxShadow = 'none';
    }
  });
  
  // Afficher la question
  document.querySelector('.terminal p').textContent = question.question;
  
  // Afficher les réponses
  const answersDiv = document.querySelector('.answers');
  answersDiv.innerHTML = '';
  
  question.reponses.forEach((reponse, index) => {
    const btn = document.createElement('button');
    btn.className = 'btn option';
    btn.textContent = reponse;
    btn.onclick = () => verifierReponse(index);
    answersDiv.appendChild(btn);
  });
}

// Vérifier la réponse
function verifierReponse(indexReponse) {
  const question = questions[quizState.questionActuelle];
  const correct = indexReponse === question.bonneReponse;
  
  // Sauvegarder la réponse
  quizState.reponses.push({
    questionId: question.id,
    reponseUser: indexReponse,
    correct: correct
  });
  
  if (correct) {
    quizState.score++;
  } else {
    quizState.vies--;
  }
  
  saveQuizState();
  
  // Vérifier si le jeu continue
  if (quizState.vies <= 0) {
    finQuizDefaite();
    return;
  }
  
  quizState.questionActuelle++;
  
  if (quizState.questionActuelle >= questions.length) {
    finQuizVictoire();
    return;
  }
  
  afficherQuestion();
}

// Fin du quiz - Défaite
function finQuizDefaite() {
  sauvegarderScore();
  
  document.getElementById('quiz').style.display = 'none';
  const invasionSection = document.querySelector('.section-invasion');
  invasionSection.style.display = 'block';
  invasionSection.scrollIntoView({ behavior: 'smooth' });
  
  const btn = invasionSection.querySelector('.btn');
  btn.onclick = startQuiz;
}

// Fin du quiz - Victoire
function finQuizVictoire() {
  sauvegarderScore();
  
  document.getElementById('quiz').style.display = 'none';
  const congratsSection = document.querySelector('.section-congrats');
  congratsSection.style.display = 'block';
  congratsSection.scrollIntoView({ behavior: 'smooth' });
  
  // Afficher le score
  congratsSection.querySelector('p').textContent = `Tu as sauvé la galaxie. Score: ${quizState.score}/${questions.length}`;
  
  const btn = congratsSection.querySelector('.btn');
  btn.onclick = afficherClassement;
}

// Sauvegarder le score dans localStorage
function sauvegarderScore() {
  const user = getCurrentUser();
  
  if (!user) return;
  
  const scoreData = {
    score: quizState.score,
    total: questions.length,
    viesRestantes: quizState.vies,
    date: new Date().toISOString(),
    pourcentage: Math.round((quizState.score / questions.length) * 100)
  };
  
  user.scores.push(scoreData);
  
  // Mettre à jour dans localStorage
  loginUser(user);
  
  // Mettre à jour la liste des utilisateurs
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

// ========================================
// PARTIE 7: CLASSEMENT
// ========================================

function afficherClassement() {
  const users = getAllUsers();
  
  // Calculer le meilleur score de chaque utilisateur
  const classement = users
    .map(user => {
      let meilleurScore = 0;
      let totalParties = user.scores.length;
      
      user.scores.forEach(s => {
        if (s.pourcentage > meilleurScore) {
          meilleurScore = s.pourcentage;
        }
      });
      
      return {
        nom: `${user.prenom} ${user.nom}`,
        meilleurScore: meilleurScore,
        totalParties: totalParties
      };
    })
    .sort((a, b) => b.meilleurScore - a.meilleurScore)
    .slice(0, 10);
  
  // Afficher le classement
  let message = '🏆 CLASSEMENT 🏆\n\n';
  classement.forEach((joueur, index) => {
    message += `${index + 1}. ${joueur.nom} - ${joueur.meilleurScore}% (${joueur.totalParties} parties)\n`;
  });
  
  alert(message);
}

// ========================================
// PARTIE 8: NAVIGATION
// ========================================

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = e.target.getAttribute('href');
    
    if (target === '#accueil') {
      document.getElementById('accueil').style.display = 'block';
      document.getElementById('quiz').style.display = 'none';
      document.querySelector('.section-invasion').style.display = 'none';
      document.querySelector('.section-congrats').style.display = 'none';
      document.getElementById('accueil').scrollIntoView({ behavior: 'smooth' });
    } else if (target === '#quiz') {
      startQuiz();
    } else if (target === '#scores') {
      afficherClassement();
    }
  });
});

// ========================================
// PARTIE 9: INITIALISATION
// ========================================

window.addEventListener('DOMContentLoaded', () => {
  // Charger l'état du quiz si il existe
  loadQuizState();
  
  // Vérifier si un utilisateur est connecté
  const user = getCurrentUser();
  if (user) {
    console.log('Utilisateur connecté:', user.prenom);
  }
  
  // Cacher les sections du quiz au démarrage
  document.getElementById('quiz').style.display = 'none';
  document.querySelector('.section-invasion').style.display = 'none';
  document.querySelector('.section-congrats').style.display = 'none';
  
  // Ajouter une transition aux barres de niveau
  document.querySelectorAll('.bar').forEach(bar => {
    bar.style.transition = 'all 0.3s ease';
  });
});