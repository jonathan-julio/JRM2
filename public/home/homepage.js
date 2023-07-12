const socket = io();
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

socket.emit('listUsers', token);


// Função para redirecionar para a página de login
function redirectToLogin() {
  localStorage.removeItem('token'); // Remove o token do armazenamento local
  window.location.href = 'loginpage'; // Redireciona para a página de login
}

function checkAuthStatus() {
  if (!token) {
    redirectToLogin();
  } else {
    socket.emit('checkAuthStatus', token);
    initializeChat();
  }
  socket.emit('listSalas', token);
}
socket.on('authStatusResponse', (response) => {
  if (!response.authenticated) {
    redirectToLogin();
  }
}); 

// Verifica o status de autenticação ao carregar a página de chatpage


// Inicializa o chat
function initializeChat() {
  // Elementos do chat
  const chatContainer = document.querySelector('.chat-container');
  const chatBox = document.querySelector('.chat-box');
  const chatInput = document.querySelector('.chat-input');
  const chatMessageInput = document.querySelector('#chat-message-input');
  const chatSendButton = document.querySelector('#chat-send-button');

  // Função para adicionar uma nova mensagem ao chat
  function addMessageToChat(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');

    if (message.username === username) {
      messageElement.classList.add('sent');
    }

    const timestampElement = document.createElement('span');
    timestampElement.classList.add('timestamp');

    if (message.username === username) {
      timestampElement.classList.add('sent');
    } else {
      timestampElement.classList.add('received');
    }

    timestampElement.textContent = message.timestamp;

    const usernameElement = document.createElement('span');
    usernameElement.classList.add('username');
    usernameElement.textContent = message.username;

    const messageContentElement = document.createElement('span');
    messageContentElement.classList.add('message');
    messageContentElement.textContent = message.message;

    messageElement.appendChild(timestampElement);
    messageElement.appendChild(usernameElement);
    messageElement.appendChild(messageContentElement);

    chatBox.appendChild(messageElement);

    // Scroll para a última mensagem
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Evento de envio de mensagem
  chatSendButton.addEventListener('click', () => {
    sendMessage();
  });

  function sendMessage() {
    const message = chatMessageInput.value.trim();
    if (message !== '') {
      const data = {
        username: username, // Nome do usuário (pode ser obtido do lado do servidor)
        message
      };
      socket.emit('chatMessage', data);
      chatMessageInput.value = '';
    }
  }
  document.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        sendMessage();
    }
    });

  // Evento de recebimento de nova mensagem
  socket.on('newChatMessage', (message) => {
    addMessageToChat(message);
  });

  // Evento de resposta das mensagens do chat
  socket.on('chatMessages', (messages) => {
    messages.forEach((message) => {
      addMessageToChat(message);
    });
  });
  
  // Solicita as mensagens do chat ao conectar
  socket.emit('requestChatMessages');
}


// Função para fazer logout
function logout() {
  socket.emit('logout'); // Emite evento de logout para o servidor
  redirectToLogin(); // Redireciona para a página de login
}

// Evento de resposta do logout
socket.on('logoutResponse', () => {
  redirectToLogin(); // Redireciona para a página de login
});



socket.on('redirecGameCustom', (data) => {
  // Redireciona o usuário para a sala
  window.location.href = data.link;
});

socket.on('authStatusResponse', (response) => {
  console.log(response.authenticated);
  if (!response.authenticated) {
    redirectToLogin();
  }
});

let listUsers = [];
let listSalas = [];

socket.on('listSalasResponse', (response) => {
  const salas = response.salas;

  // Limpa o conteúdo atual da seção "salas-box"
  const salasBox = document.getElementById('salas-box');
  salasBox.innerHTML = '';

  // Itera sobre a lista de salas e cria elementos HTML para cada uma
  salas.forEach((sala) => {
    // Cria um elemento <p> para exibir o nome da sala
    const salaElement = document.createElement('p');
    console.log(sala)
    salaElement.textContent = sala.admin+" " + sala.idSala;

    salaElement.addEventListener('click', () => {
      // Redireciona o usuário para a página "/gameplay?sala=idSala"
      window.location.href = '/gameplay?sala=' + sala.idSala;
    });

    // Adiciona o elemento da sala à seção "salas-box"
    salasBox.appendChild(salaElement);
  });
});

document.addEventListener('DOMContentLoaded', function () {
  // Variável global para controlar o usuário com opções abertas
  var activeUser = null;

  // Função para exibir a lista de usuários
  function showUserList(userList) {
    var usersBox = document.getElementById('users-box');

    // Limpa o conteúdo atual da caixa de usuários
    usersBox.innerHTML = '';

    // Itera sobre a lista de usuários e cria elementos para cada um
    userList.forEach(function (username) {
      // Cria um elemento <div> para cada usuário
      var userElement = document.createElement('div');
      userElement.classList.add('user');

      // Cria um elemento <p> para exibir o nome do usuário
      var usernameElement = document.createElement('p');
      usernameElement.classList.add('user-name');
      usernameElement.textContent = username;
      userElement.appendChild(usernameElement);

      // Adiciona um evento de clique para exibir as opções
      userElement.addEventListener('click', function () {
        toggleUserOptions(userElement, username);
      });

      // Adiciona o elemento do usuário à caixa de usuários
      usersBox.appendChild(userElement);
    });

    // Adiciona um evento de clique no documento para fechar as opções ao clicar fora do box
    document.addEventListener('click', function (event) {
      var target = event.target;
      if (activeUser && !activeUser.contains(target)) {
        activeUser.querySelector('.user-options').classList.remove('show');
        activeUser = null;
      }
    });
  }

  

  

  // Função para exibir/ocultar as opções de usuário
  function toggleUserOptions(userElement, username) {


    // Verifica se o usuário atual é o mesmo que o usuário anteriormente ativo
    if (activeUser && activeUser !== userElement) {
      // Fecha as opções do usuário anterior
      var previousOptionsDiv = activeUser.querySelector('.user-options');
      if (previousOptionsDiv) {
        previousOptionsDiv.classList.remove('show');
      }
      activeUser = null;
    }

    var optionsDiv = userElement.querySelector('.user-options');
    var isOptionsVisible = optionsDiv && optionsDiv.classList.contains('show');


    // Verifica se o elemento 'user-options' já existe
    if (!optionsDiv) {
      optionsDiv = document.createElement('div');
      optionsDiv.classList.add('user-options');

      // Cria o botão de fechar
      var closeButton = document.createElement('span');
      closeButton.textContent = 'X';
      closeButton.classList.add('close-button');
      closeButton.addEventListener('click', function (event) {
        event.stopPropagation();
        optionsDiv.classList.remove('show');
        activeUser = null;
      });
      optionsDiv.appendChild(closeButton);

      // Cria a linha de separação
      var separator = document.createElement('div');
      separator.classList.add('separator');
      optionsDiv.appendChild(separator);

      // Cria um elemento <p> para a opção de perfil
      var profileOption = document.createElement('p');
      profileOption.textContent = 'Ver Perfil';
      profileOption.addEventListener('click', function (event) {
        event.stopPropagation();
        console.log('Ver perfil do usuário: ' + username);
        socket.emit('friendRequest', { token: token, username: username });
        // Adicione a lógica para exibir o perfil do usuário
      });
      optionsDiv.appendChild(profileOption);

      // Cria um elemento <p> para a opção de adicionar como amigo
      /* var addFriendOption = document.createElement('p');
      addFriendOption.textContent = 'Adicionar como Amigo';
      addFriendOption.addEventListener('click', function(event) {
        event.stopPropagation();
        console.log('Adicionar usuário como amigo: ' + username);
        // Adicione a lógica para adicionar o usuário como amigo
      });
      optionsDiv.appendChild(addFriendOption); */

      // Adiciona o elemento 'user-options' ao elemento do usuário
      userElement.appendChild(optionsDiv);
    }

    // Verifica se as opções devem ser exibidas ou ocultadas
    if (isOptionsVisible) {
      optionsDiv.classList.remove('show');
      activeUser = null;
    } else {
      optionsDiv.classList.add('show');
      activeUser = userElement;
    }
  }

  socket.on('listUserResponse', (response) => {
    listUsers = response.listUser.slice();
    console.log(listUsers);
    showUserList(listUsers);
  });
});




function criarSala() {
  window.location.href = 'gameplay';
}
