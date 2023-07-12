// Conexão com o servidor de socket
const socket = io();
console.log("iniciou");

// Verifica se o usuário está autenticado
/* function checkAuthStatus() {
  const currentPage = window.location.pathname;
  const token = localStorage.getItem('token');

  if (currentPage === '/homepage' && token) {
    socket.emit('checkAuthStatus', token);
    console.log(token);
  } else {
    console.log(currentPage);
    redirectToLogin();
  }
} */

// Evento de resposta do status de autenticação
socket.on('authStatusResponse', (response) => {
  if (response.authenticated) {
    redirectToHomepage();
  } else {
    redirectToLogin();
  }
});

// Função de cadastro
function signup() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Envia os dados de cadastro para o servidor
  socket.emit('signup', { username, password });
}

// Função de login
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Envia os dados de login para o servidor
  socket.emit('login', { username: username, password : password});
}

// Evento de resposta do cadastro
socket.on('signupResponse', (response) => {
  if (response.success) {
    showMessage(response.message);
  } else {
    showMessage(response.message);
  }
});

// Evento de resposta do login
socket.on('loginResponse', (response) => {
  if (response.success) {
    showMessage(response.message);

    // Armazena o token de autenticação no localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('socket', socket);
    localStorage.setItem('username', response.username);

    redirectToHomepage();
  } else {
    showMessage(response.message);
  }
});

// Função para exibir mensagens no documento
function showMessage(message) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
}

// Redireciona para a página de login
function redirectToLogin() {
  window.location.href = '/loginpage';
}

// Redireciona para a página inicial
function redirectToHomepage() {
  window.location.href = '/homepage';
}



// Verifica o status de autenticação ao carregar a página
//checkAuthStatus();
