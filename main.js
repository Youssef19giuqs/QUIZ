// Gestion de l'authentification
const AUTH_KEY = 'quiz_spaceship_user';
const USERS_KEY = 'quiz_spaceship_users';

// Fonction pour afficher/masquer le mot de passe
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

// Fonction pour calculer la force du mot de passe
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
document.getElementById('password')?.addEventListener('input', (e) => {
  const password = e.target.value;
  const strength = checkPasswordStrength(password);
  const meter = document.getElementById('pwdMeter');
  const hint = document.getElementById('pwdHint');
  
  meter.value = strength;
  
  const labels = ['très faible', 'faible', 'moyen', 'fort', 'très fort'];
  hint.textContent = `Force: ${labels[strength]}`;
});

// Récupérer tous les utilisateurs
function getAllUsers() {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
}

// Sauvegarder un nouvel utilisateur
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

// Connecter l'utilisateur
function loginUser(userData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
}

// Récupérer l'utilisateur connecté
function getCurrentUser() {
  const user = localStorage.getItem(AUTH_KEY);
  return user ? JSON.parse(user) : null;
}

// Déconnecter l'utilisateur
function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
}

// Vérifier si l'utilisateur est connecté
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Gérer la soumission du formulaire d'inscription
document.getElementById('signup')?.addEventListener('submit', (e) => {
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
  
  // Vérifier si l'email existe déjà
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
    password, // En production, il faudrait hasher le mot de passe
    dateInscription: new Date().toISOString(),
    scores: []
  };
  
  // Sauvegarder l'utilisateur
  saveUser(userData);
  
  // Connecter automatiquement
  loginUser(userData);
  
  // Afficher un message de succès
  alert(`Bienvenue ${prenom} ! Ton compte a été créé avec succès.`);
  
  // Rediriger vers le quiz
  document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
  
  // Réinitialiser le formulaire
  e.target.reset();
});

// Vérifier l'état de connexion au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
  const currentUser = getCurrentUser();
  
  if (currentUser) {
    console.log('Utilisateur connecté:', currentUser.prenom);
    // Vous pouvez afficher le nom de l'utilisateur dans l'interface
    // updateUIForLoggedInUser(currentUser);
  } else {
    console.log('Aucun utilisateur connecté');
  }
});

// Exemple de fonction pour mettre à jour l'interface
function updateUIForLoggedInUser(user) {
  const title = document.querySelector('.title');
  if (title) {
    title.textContent = `QUIZ PIXEL SPACESHIP - ${user.prenom}`;
  }
}

// Fonction pour sauvegarder un score
function saveScore(score, totalQuestions) {
  const user = getCurrentUser();
  
  if (!user) {
    alert('Vous devez être connecté pour sauvegarder votre score.');
    return;
  }
  
  const scoreData = {
    score,
    totalQuestions,
    date: new Date().toISOString(),
    percentage: Math.round((score / totalQuestions) * 100)
  };
  
  user.scores.push(scoreData);
  
  // Mettre à jour l'utilisateur dans localStorage
  loginUser(user);
  
  // Mettre à jour dans la liste des utilisateurs
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

// Fonction pour obtenir le classement
function getLeaderboard() {
  const users = getAllUsers();
  
  return users
    .map(user => {
      const bestScore = user.scores.reduce((best, current) => {
        return current.percentage > best ? current.percentage : best;
      }, 0);
      
      return {
        nom: `${user.prenom} ${user.nom}`,
        bestScore,
        totalGames: user.scores.length
      };
    })
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, 10); // Top 10
}