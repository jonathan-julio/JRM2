const app = require('express')();
const http = require('http').createServer(app);
const fs = require('fs');
const io = require('socket.io')(http, {
  cors: {
    origin: "https://jonathan-julio.github.io",
    methods: ["GET", "POST"]
  }
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://jonathan-julio.github.io');
  next();
});

app.get('/style.css', (req, res) => {
  res.sendFile(__dirname + '/public/style.css');
});

app.get('/script.js', (req, res) => {
  res.sendFile(__dirname + '/public/script.js');
});

//------------------homepage ----------------
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/home/homepage.html');
});

app.get('/homepage', (req, res) => {
  res.sendFile(__dirname + '/public/home/homepage.html');
});

app.get('/home/homepage.js', (req, res) => {
  res.sendFile(__dirname + '/public/home/homepage.js');
});

app.get('/home/homeStyle.css', (req, res) => {
  res.sendFile(__dirname + '/public/home/homeStyle.css');
});

//------------------login/cell ----------------
app.get('/loginpage', (req, res) => {
  res.sendFile(__dirname + '/public/loginpage.html');
});

app.get('/celpage', (req, res) => {
  res.sendFile(__dirname + '/public/mobile/celPage.html');
});

//------------------GameSolo ----------------
app.get('/gamesolo', (req, res) => {
  res.sendFile(__dirname + '/public/gameSolo/index.html');
});

app.get('/gameSolo/game.js', (req, res) => {
  res.sendFile(__dirname + '/public/gameSolo/game.js');
});

//------------------gameCustom ----------------
app.get('/gameplay', (req, res) => {
  res.sendFile(__dirname + '/public/gameCustom/gameplay.html');
});

app.get('/gameplay.js', (req, res) => {
  res.sendFile(__dirname + '/public/gameCustom/gameplay.js');
});

app.get('/gameCustom/customStyle.css', (req, res) => {
  res.sendFile(__dirname + '/public/gameCustom/customStyle.css');
});



const users = [];
const salas = [];
const chatMessages = [];
const gameplay = [];

function generateAuthToken() {
  const token = Math.random().toString(36).substr(2);
  return token;
}

function Usuario(socket, username, password, playerX, playerY, token, deaths) {
  this.socket = socket;
  this.username = username;
  this.password = password;
  this.playerX = playerX;
  this.playerY = playerY;
  this.token = token;
  this.deaths = deaths;
}

function sala(idSala, admin, usuarios, status) {
  this.idSala = idSala;
  this.admin = admin;
  this.usuarios = usuarios;
  this.status = status;
}


io.on('connection', (socket) => {
  socket.on('signup', (userData) => {
    const existingUser = users.find(user => user.username === userData.username);

    if (existingUser) {
      socket.emit('signupResponse', { success: false, message: 'Usuário já cadastrado' });
    } else {
      const user = new Usuario(socket, userData.username, userData.password, 0, 0, "", 0);
      users.push(user);
      socket.emit('signupResponse', { success: true, message: 'Cadastro realizado com sucesso' });
    }
  });

  socket.on('login', (userData) => {
    const user = users.find(user => user.username === userData.username && user.password === userData.password);
    if (user) {
      user.token = generateAuthToken();
      user.socket = socket;
      socket.emit('loginResponse', { success: true, message: 'Login realizado com sucesso', token: user.token, username: user.username });
    } else {
      socket.emit('loginResponse', { success: false, message: 'Usuário ou senha inválidos' });
    }
  });

  socket.on('disconnect', () => {
    const user = users.find(user => user.socket === socket);
    if (user) {
      user.socket = null;
    }
  });

  socket.on('checkAuthStatus', (token) => {
    const user = users.find(user => user.token === token);
    if (user) {
      user.socket = socket;
      user.playerX = 0;
      user.playerY = 0;
      socket.authenticated = true;
      socket.emit('authStatusResponse', { authenticated: true });
    } else {
      socket.authenticated = false;
      socket.emit('authStatusResponse', { authenticated: false });
    }
  });

  socket.on('chatMessage', (data) => {
    console.log("mensagem")
    const timestamp = new Date().toLocaleString();
    const message = {
      username: data.username,
      message: data.message,
      timestamp: timestamp
    };
    // Armazena a mensagem no array de mensagens do chat
    chatMessages.push(message);
    // Emite a nova mensagem para todos os usuários conectados
    io.emit('newChatMessage', message);
  });

  socket.on('listUsers', (token) => {
    const user = users.find(user => user.token === token);
    var listUser = [];
    //user.socket = socket;
    try {
      if (users) {
        for (let index = 0; index < users.length; index++) {
          if (users[index].token !== token) {
            listUser.push(users[index].username);
          }
        }
        if (listUser.length !== 0) {
          socket.emit('listUserResponse', { listUser: listUser });
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on('listSalas', (token) => {
    let listSalas = [];
    for (const sala of salas) {
      listSalas.push( { idSala: sala.idSala, admin : sala.admin });
    }
    try {
      console.log("lista")
       socket.emit('listSalasResponse', { salas: listSalas });
    } catch (error) {
      console.log(error);
    }
  });


  socket.on('gameCustom', (token) => {
    const user = users.find(user => user.token === token);
    const sala_ = new sala(generateAuthToken(), user.username, [], false);
    salas.push(sala_);
    const salaLink = '/gameplay?sala=' + sala_.idSala;
    socket.emit('redirecGameCustom', { link: salaLink });
  })


  socket.on('playgame', (data) => {
    const user = users.find((user) => user.token === data.token);
    const sala = salas.find((sala) => sala.idSala === data.idSala);
    if (sala && sala.admin === user.username) {
      for (let index = 0; index < sala.usuarios.length; index++) {
        const userSocket = sala.usuarios[index].socket;
        /* fs.readFile('game.js', 'utf8', (err, data) => {
          if (err) {
            console.error(err);
            return;
          }
          socket.emit('gameCode', data);
        }); */
        console.log("init playgame");
        userSocket.emit("playgame",{maps : construirMaps(maps)});
      }
    }
  });

  socket.on("userPosition", (data) => {
    const sala = salas.find((sala) => sala.idSala === data.idSala);
    if (sala) {
      for (const user of sala.usuarios) {
        if (user.socket !== socket && user.token === data.token) {
          user.playerX = data.playerX;
          user.playerY = data.playerY;
        }else{
          user.playerX = 0;
          user.playerY = 0;
        }
      }
      for (const user of sala.usuarios) {
        user.socket.emit("updatePosition", { usuarios: sala.usuarios });
      }
      
    }
  });

  socket.on('initGameCustom', (data) => {
    const user = users.find((user) => user.token === data.token);
    const sala = salas.find((sala) => sala.idSala === data.sala);

    if (user && sala) {
      user.socket = socket;
      console.log("usuarios : " + sala.usuarios)
      if (!sala.usuarios.includes(user)) {
        sala.usuarios.push(user);
      }
      console.log("usuarios : " + sala.usuarios.length)

      let _users = sala.usuarios.map((usuario) => usuario.username);

      for (let index = 0; index < sala.usuarios.length; index++) {
        const element = sala.usuarios[index];
        console.log('socket : ' + element.username);
        element.socket.emit('initGameCustomResponse', { positionUser: index, users: _users });
      }
    } else {
      console.log("algo deu errado.")
    }
  });

  // Evento para solicitar as mensagens do chat ao conectar
  socket.on('requestChatMessages', () => {
    socket.emit('chatMessages', chatMessages);
  });

  socket.on('disconnect', () => {
    console.log('Um usuário se desconectou:');
    for (let index = 0; index < salas.length; index++) {
      const element = salas[index];
      for (let i = 0; i < element.usuarios.length; i++) {
        const _usuario = element.usuarios[i];
        if (_usuario.socket == null) {
          if (element.usuarios.length === 1) {
            salas.splice(index, 1);
            console.log("aqui")
          }
          else {
            console.log("aqui 2")
            element.usuarios.splice(i, 1);
            element.admin = element.usuarios[0];
            for (let j = 0; j < element.usuarios.length; j++) {
              const _usuarioRestante = element.usuarios[j];
              const salaLink = '/gameplay?sala=' + element.idSala;
              _usuarioRestante.socket.emit('redirecGameCustom', { link: salaLink });
            }
          }
        }
      }
    }
  });
});

const port = 3000;
http.listen(port, () => {
  console.log(`Servidor socket rodando na porta ${port}`);
});


let maps = 
        [
          'aaaaaaaaaaaaaaa',
          'a  zz zzz zz  a',
          'a azazazazaza a',
          'azzzzzzzzzzzzza',
          'a azazazazaza a',
          'azzzzzzzzzzzzza',
          'azazazazazazaza',
          'azzzz * zzzzzza',
          'azazazazazazaza',
          'azzzzzzzzzzzzza',
          'a azazazazaza a',
          'azzzzzzzzzzzzza',
          'a azazazazaza a',
          'a  zz zzz zz  a',
          'aaaaaaaaaaaaaaa',
        ]
      ;
      
      // Função para substituir 'z' por 'r' e 'd'
    


function construirMaps(maps_){

  function gerarValorAleatorio() {
    return Math.floor(Math.random() * 14) + 1;
  }
  

  function mudarValor(matriz, linha, coluna, novaLetra) {
    const linhaArray = matriz[linha].split('');
        if (linhaArray[coluna] === "z") {
            linhaArray[coluna] = novaLetra;
            matriz[linha] = linhaArray.join('');
            return matriz
        }
        return null;// Retornar null se a posição estiver fora dos limites da matriz
  }
  
  function verificarAlteracao(maps_, letra ){
    let matriz = maps;
    const temp = mudarValor(maps_, gerarValorAleatorio(), gerarValorAleatorio(), letra);
    if (temp) {
        matriz =  temp;
    }
    return matriz;
  }

  let count = 0; 

  while (count < 5) {
      maps = verificarAlteracao(maps, "d"); 
      count = 0; 
      for (let i = 0; i < maps.length; i++) {
          const linha = maps[i];
          for (let j = 0; j < linha.length; j++) {
              if (linha[j] === 'd') {
                  count++;
              }
          }
      }
  }
  count = 0;

  while (count < 5) {
      maps = verificarAlteracao(maps, "r"); 
      count = 0;        
      for (let i = 0; i < maps.length; i++) {
          const linha = maps[i];
          for (let j = 0; j < linha.length; j++) {
              if (linha[j] === 'r') {
                  count++;
              }
          }
      }
  }
  return maps;
}