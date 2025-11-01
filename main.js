const app = {
  questions: [
    {
      question: "Quelle planète est la plus proche du Soleil ?",
      answers: ["Mercure", "Vénus", "Terre", "Mars"],
      correct: 0
    },
    {
      question: "Combien de planètes compte notre système solaire ?",
      answers: ["7", "8", "9", "10"],
      correct: 1
    },
    {
      question: "Quelle est la plus grande planète du système solaire ?",
      answers: ["Saturne", "Neptune", "Jupiter", "Uranus"],
      correct: 2
    },
    {
      question: "Quelle planète est surnommée la planète rouge ?",
      answers: ["Vénus", "Mars", "Jupiter", "Saturne"],
      correct: 1
    },
    {
      question: "Combien de temps met la Terre pour faire le tour du Soleil ?",
      answers: ["30 jours", "365 jours", "100 jours", "500 jours"],
      correct: 1
    },
    {
      question: "Quelle planète possède des anneaux visibles ?",
      answers: ["Mars", "Jupiter", "Saturne", "Neptune"],
      correct: 2
    },
    {
      question: "Quel est le satellite naturel de la Terre ?",
      answers: ["Titan", "Europa", "La Lune", "Io"],
      correct: 2
    },
    {
      question: "Quelle est l'étoile la plus proche de la Terre ?",
      answers: ["Proxima du Centaure", "Le Soleil", "Sirius", "Alpha du Centaure"],
      correct: 1
    }
  ],

  currentQuestion: 0,
  score: 0,
  lives: 5,
  currentUser: null,

  // ========================================
  // INITIALISATION
  // ========================================
  init() {
    this.checkAuth();
    this.setupPasswordValidator();
    this.setupForms();
    this.showHome();
  },

  // ========================================
  // GESTION DE L'AUTHENTIFICATION
  // ========================================
  checkAuth() {
    const users = this.getUsers();
    const loggedEmail = this.getVariable('loggedUser');
    
    if (loggedEmail) {
      this.currentUser = users.find(u => u.email === loggedEmail);
      if (this.currentUser) {
        this.updateUIForLoggedUser();
        return true;
      }
    }
    
    this.currentUser = null;
    this.updateUIForGuest();
    return false;
  },

  updateUIForLoggedUser() {
    document.getElementById('navAuth').style.display = 'none';
    document.getElementById('navQuiz').disabled = false;
    document.getElementById('navScores').disabled = false;
    
    const badge = document.getElementById('userBadge');
    badge.style.display = 'flex';
    badge.className = 'user-badge';
    badge.innerHTML = `
      <span class="icon">👤</span>
      <span>${this.currentUser.prenom}</span>
      <button class="logout-btn" onclick="app.logout()">Déconnexion</button>
    `;
  },

  updateUIForGuest() {
    document.getElementById('navAuth').style.display = 'block';
    document.getElementById('navQuiz').disabled = true;
    document.getElementById('navScores').disabled = true;
    document.getElementById('userBadge').style.display = 'none';
  },

  switchTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    
    if (tab === 'login') {
      tabs[0].classList.add('active');
      document.getElementById('loginForm').classList.add('active');
    } else {
      tabs[1].classList.add('active');
      document.getElementById('signupForm').classList.add('active');
    }
    
    this.hideError('loginError');
    this.hideError('signupError');
  },

  setupForms() {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    document.getElementById('signupForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSignup();
    });
  },

  handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      this.showError('loginError', 'Veuillez remplir tous les champs.');
      return;
    }

    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      this.setVariable('loggedUser', email);
      this.currentUser = user;
      this.updateUIForLoggedUser();
      this.showHome();
      this.showNotification('Connexion réussie ! Bienvenue ' + user.prenom + ' 🚀');
    } else {
      this.showError('loginError', 'Email ou mot de passe incorrect.');
    }
  },

  handleSignup() {
    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const terms = document.getElementById('terms').checked;

    if (!prenom || !nom || !email || !password) {
      this.showError('signupError', 'Veuillez remplir tous les champs.');
      return;
    }

    if (password.length < 8) {
      this.showError('signupError', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (!terms) {
      this.showError('signupError', 'Vous devez accepter les conditions d\'utilisation.');
      return;
    }

    const users = this.getUsers();
    
    if (users.find(u => u.email === email)) {
      this.showError('signupError', 'Cette adresse email est déjà utilisée.');
      return;
    }

    const newUser = { prenom, nom, email, password };
    users.push(newUser);
    this.setVariable('users', JSON.stringify(users));
    this.setVariable('loggedUser', email);
    
    this.currentUser = newUser;
    this.updateUIForLoggedUser();
    this.showHome();
    this.showNotification('Inscription réussie ! Bienvenue à bord ' + prenom + ' 🚀');
  },

  logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      this.setVariable('loggedUser', '');
      this.currentUser = null;
      this.updateUIForGuest();
      this.showHome();
      this.showNotification('Déconnexion réussie. À bientôt ! 👋');
    }
  },

  // ========================================
  // GESTION DU LOCAL STORAGE
  // ========================================
  getUsers() {
    const data = this.getVariable('users');
    return data ? JSON.parse(data) : [];
  },

  getVariable(key) {
    try {
      return sessionStorage.getItem(key) || '';
    } catch {
      return '';
    }
  },

  setVariable(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  // ========================================
  // NAVIGATION
  // ========================================
  hideAllSections() {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  },

  showHome() {
    this.hideAllSections();
    document.getElementById('accueil').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  showAuth() {
    if (this.currentUser) {
      this.showNotification('Vous êtes déjà connecté !');
      return;
    }
    this.hideAllSections();
    document.getElementById('auth').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  showQuiz() {
    if (!this.checkAuth()) {
      this.showNotification('⚠️ Vous devez être connecté pour accéder au quiz !');
      this.showAuth();
      return;
    }
    this.hideAllSections();
    document.getElementById('quiz').classList.add('active');
    this.resetQuiz();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  showInvasion() {
    this.hideAllSections();
    document.getElementById('invasion').classList.add('active');
    document.getElementById('invasionScore').textContent = this.score;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  showScores() {
    if (!this.checkAuth()) {
      this.showNotification('⚠️ Vous devez être connecté pour voir les scores !');
      this.showAuth();
      return;
    }
    this.hideAllSections();
    document.getElementById('scores').classList.add('active');
    this.displayResults();
    this.loadLeaderboard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ========================================
  // GESTION DU MOT DE PASSE
  // ========================================
  togglePassword(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
  },

  setupPasswordValidator() {
    const pwd = document.getElementById('password');
    const meter = document.getElementById('pwdMeter');
    const hint = document.getElementById('pwdHint');

    pwd.addEventListener('input', () => {
      const score = this.scorePassword(pwd.value);
      meter.value = score;
      hint.textContent = 'Force: ' + this.getPasswordLabel(score);
    });
  },

  scorePassword(value) {
    let score = 0;
    if (!value) return 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return Math.min(score, 4);
  },

  getPasswordLabel(score) {
    const labels = ['très faible', 'faible', 'moyenne', 'forte', 'très forte'];
    return labels[score];
  },

  // ========================================
  // GESTION DU QUIZ
  // ========================================
  resetQuiz() {
    this.currentQuestion = 0;
    this.score = 0;
    this.lives = 5;
    this.updateLives();
    this.updateQuizDisplay();
  },

  restartQuiz() {
    if (!this.checkAuth()) {
      this.showNotification('⚠️ Vous devez être connecté pour jouer !');
      this.showAuth();
      return;
    }
    this.resetQuiz();
    this.showQuiz();
  },

  updateQuizDisplay() {
    const q = this.questions[this.currentQuestion];
    
    document.getElementById('questionCount').textContent = 
      `Question ${this.currentQuestion + 1}/${this.questions.length}`;
    
    document.getElementById('questionText').textContent = q.question;
    
    const container = document.getElementById('answersContainer');
    container.innerHTML = '';
    
    q.answers.forEach((answer, index) => {
      const btn = document.createElement('button');
      btn.className = 'btn option';
      btn.textContent = answer;
      btn.onclick = () => this.checkAnswer(index);
      container.appendChild(btn);
    });
  },

  updateLives() {
    const hearts = '❤'.repeat(this.lives) + '🖤'.repeat(5 - this.lives);
    document.getElementById('lives').textContent = hearts;
  },

  checkAnswer(answerIndex) {
    const q = this.questions[this.currentQuestion];
    
    if (answerIndex === q.correct) {
      this.score++;
      this.currentQuestion++;
      
      if (this.currentQuestion >= this.questions.length) {
        this.saveScore();
        this.showScores();
      } else {
        this.updateQuizDisplay();
      }
    } else {
      this.lives--;
      this.updateLives();
      
      if (this.lives === 0) {
        this.saveScore();
        this.showInvasion();
      } else {
        this.showNotification('Mauvaise réponse ! Tu perds une vie. 💔');
      }
    }
  },

  // ========================================
  // GESTION DES SCORES
  // ========================================
  saveScore() {
    if (!this.currentUser) return;
    
    const scores = this.getScores();
    scores.push({
      name: this.currentUser.prenom,
      email: this.currentUser.email,
      score: this.score,
      date: new Date().toISOString()
    });
    
    this.setVariable('leaderboard', JSON.stringify(scores));
  },

  getScores() {
    const data = this.getVariable('leaderboard');
    return data ? JSON.parse(data) : [];
  },

  displayResults() {
    document.getElementById('finalScore').textContent = this.score;

    const resultDiv = document.getElementById('resultMessage');
    
    if (this.score === 8) {
      resultDiv.innerHTML = `
        <h2 class="pixel-heading">PERFECT! 🌟</h2>
        <p style="font-size:1.2rem; margin:1.5rem 0">Tu as sauvé la galaxie avec un score parfait !</p>
      `;
    } else if (this.score >= 6) {
      resultDiv.innerHTML = `
        <h2 class="pixel-heading">BRAVO ! 🎉</h2>
        <p style="font-size:1.2rem; margin:1.5rem 0">Tu as sauvé la galaxie !</p>
      `;
    } else if (this.score >= 4) {
      resultDiv.innerHTML = `
        <h2 class="pixel-heading">PAS MAL ! 👍</h2>
        <p style="font-size:1.2rem; margin:1.5rem 0">Tu as survécu à l'invasion spatiale.</p>
      `;
    } else {
      resultDiv.innerHTML = `
        <h2 class="pixel-heading">GAME OVER 💫</h2>
        <p style="font-size:1.2rem; margin:1.5rem 0">Continue de t'entraîner, pilote !</p>
      `;
    }
  },

  loadLeaderboard() {
    let scores = this.getScores();
    
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);
    
    const leaderboardDiv = document.getElementById('leaderboardList');
    leaderboardDiv.innerHTML = '';
    
    if (scores.length === 0) {
      leaderboardDiv.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--muted)">Aucun score pour le moment. Sois le premier !</p>';
      return;
    }
    
    scores.forEach((entry, index) => {
      const item = document.createElement('div');
      item.className = 'leaderboard-item';
      
      if (this.currentUser && entry.email === this.currentUser.email && entry.score === this.score) {
        item.classList.add('current-user');
      }
      
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1) + '.';
      
      item.innerHTML = `
        <span class="rank">${medal}</span>
        <span class="name">${entry.name}</span>
        <span class="points">${entry.score}/8</span>
      `;
      
      leaderboardDiv.appendChild(item);
    });
  },

  // ========================================
  // UTILITAIRES
  // ========================================
  showError(id, message) {
    const errorDiv = document.getElementById(id);
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
  },

  hideError(id) {
    const errorDiv = document.getElementById(id);
    errorDiv.classList.remove('show');
  },

  showNotification(message) {
    alert(message);
  }
};

// ========================================
// INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});