const socket = io();
const token = localStorage.getItem('token');
let listUsers = [];
let positionUser;
const url = window.location.href;
const params = new URLSearchParams(new URL(url).search);
const sala = params.get("sala");
let playerMoveUp = false;
let playerMoveDown = false;
let playerMoveLeft = false;
let playerMoveRight = false;
const sprintePlayer1 = "07mXXO1.png"
const sprintePlayer2 = "VIZml7k.png"
const sprintePlayer3 = "8aGMyu7.png"
const sprintePlayer4 = "LTVjZ3M.png"

let players = []

var playerX = 0;
var playerY = 0;

function play(sprinte, playerX, playerY) {
  this.sprinte = sprinte;
  this.playerX = playerX;
  this.playerY = playerY;
}



socket.emit('initGameCustom', {token: token, sala: sala});

function updatePlayText() {
  const botoes = [
    document.querySelector('#play1'),
    document.querySelector('#play2'),
    document.querySelector('#play3'),
    document.querySelector('#play4')
  ];

  for (let index = 0; index < botoes.length; index++) {
    if (index < listUsers.length) {
      botoes[index].textContent = listUsers[index];
      botoes[index].style.color = index == positionUser ? 'blue' : 'green';
    }
  }
}

socket.on('initGameCustomResponse', function(data) {
  listUsers = data.users;
  positionUser = data.positionUser;
  console.log("listUsers: " + listUsers);
  updatePlayText();
  
  const playGameButton = document.querySelector('#play-game-button');
  if (positionUser === 0) {
    playGameButton.style.display = 'block';
  } else {
    playGameButton.style.display = 'none';
  }
});

function redirectToLogin() {
  localStorage.removeItem('token'); // Remove o token do armazenamento local
  window.location.href = 'loginpage'; // Redireciona para a página de login
}

function redirectToHome() {
  window.location.href = '/'; // Redireciona para a página de login
}

// Função para fazer logout
function logout() {
  socket.emit('logout'); // Emite evento de logout para o servidor
  redirectToLogin(); // Redireciona para a página de login
}

socket.on('userConnected', function(data) {
  // Evento simulado de usuário conectado recebido via socket
  console.log('Usuário conectado:', data);
  usuariosConectados.push(data.username);
  exibirUsuariosConectados();
});

socket.on('updatePosition', function(data) {
  for (let index = 0; index < data.usuarios.length; index++) {
    const element = data.usuarios[index];
    players[index].move(MOVE_SPEED * element.playerX , MOVE_SPEED *element.playerX);
    players[index].dir = vec2(element.playerX, element.playerY)
      console.log("index : "+ index);
      console.log(element.username +" x : "+ element.playerX)
      console.log(element.username +" y : "+ element.playerY)
  }

})
function iniciarPartida(){
  socket.emit('playgame', {idSala : sala, token : token})
}

function sendPlayerPosition() {
  console.log("aqui: " + players[positionUser].pos );

  let x;
  let y;
  if (playerMoveUp ) {
    x = 0;
    y = -1;
  } else if (playerMoveDown ) {
    x = 0;
    y = 1;
  }
  if (playerMoveLeft) {
    x = -1;
    y = 0;
    playerX -= 1;
  } else if (playerMoveRight) {
    x = 1;
    y = 0;
  }

  socket.emit('userPosition', { token : token , idSala : sala , playerX: x, playerY: y });
}

// Evento de pressionar a tecla
document.addEventListener('keydown', function(event) {
  if (event.key === 'ArrowUp') {
    playerMoveUp = true;
    sendPlayerPosition();
  } else if (event.key === 'ArrowDown') {
    playerMoveDown = true;
    sendPlayerPosition();
  } else if (event.key === 'ArrowLeft') {
    playerMoveLeft = true;
    sendPlayerPosition();
  } else if (event.key === 'ArrowRight') {
    playerMoveRight = true;
    sendPlayerPosition();
  }
});

// Evento de soltar a tecla
document.addEventListener('keyup', function(event) {
  if (event.key === 'ArrowUp') {
    playerMoveUp = false;
    sendPlayerPosition();
  } else if (event.key === 'ArrowDown') {
    playerMoveDown = false;
    sendPlayerPosition();
  } else if (event.key === 'ArrowLeft') {
    playerMoveLeft = false;
    sendPlayerPosition();
  } else if (event.key === 'ArrowRight') {
    playerMoveRight = false;
    sendPlayerPosition();
  }
}); 

socket.on('playgame', function(data) {
  let maps = data.maps;

  kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0,0,0,1]
  })
   const MOVE_SPEED = 120;
   const ENEMY_SPEED = 60;
  
  loadRoot('https://i.imgur.com/');
  
  loadSprite('wall-steel', 'EkleLlt.png'); 
  loadSprite('brick-red', 'C46n8aY.png');
  loadSprite('door', 'Ou9w4gH.png');
  loadSprite('kaboom', 'o9WizfI.png');
  loadSprite('bg', 'qIXIczt.png');
  loadSprite('wall-gold', 'VtTXsgH.png');
  loadSprite('brick-wood', 'U751RRV.png');
  loadSprite('speed', "WTXfXa5.png" );
  loadSprite('chute', "DZiAY0J.png");
  loadSprite('escorregarBomba', "kwWf85C.png");
  loadSprite('fogo', "vVCA5Ky.png");
  loadSprite('luva', "3KFQ7qI.png");

  

  loadSprite('bombermanPlayer1', sprintePlayer1, {
    sliceX: 7,
    sliceY: 4,
    anims: {
      //stoped
      idleLeft: { from: 21, to: 21 },
      idleRight: { from: 7, to: 7 },
      idleUp: { from: 0, to: 0 },
      idleDown: { from: 14, to: 14 },
  
      //move
      moveLeft: { from: 22 , to: 27  },
      moveRigth: { from: 8, to: 13 },
      moveUp: { from: 1, to: 6 },
      moveDown: { from: 15, to: 20 },    
    }
  });

  loadSprite('bombermanPlayer2', sprintePlayer2, {
    sliceX: 7,
    sliceY: 4,
    anims: {
      //stoped
      idleLeft: { from: 21, to: 21 },
      idleRight: { from: 7, to: 7 },
      idleUp: { from: 0, to: 0 },
      idleDown: { from: 14, to: 14 },
  
      //move
      moveLeft: { from: 22 , to: 27  },
      moveRigth: { from: 8, to: 13 },
      moveUp: { from: 1, to: 6 },
      moveDown: { from: 15, to: 20 },    
    }
  });

  loadSprite('bombermanPlayer3', sprintePlayer3, {
    sliceX: 7,
    sliceY: 4,
    anims: {
      //stoped
      idleLeft: { from: 21, to: 21 },
      idleRight: { from: 7, to: 7 },
      idleUp: { from: 0, to: 0 },
      idleDown: { from: 14, to: 14 },
  
      //move
      moveLeft: { from: 22 , to: 27  },
      moveRigth: { from: 8, to: 13 },
      moveUp: { from: 1, to: 6 },
      moveDown: { from: 15, to: 20 },    
    }
  });

  loadSprite('bombermanPlayer4', sprintePlayer4, {
    sliceX: 7,
    sliceY: 4,
    anims: {
      //stoped
      idleLeft: { from: 21, to: 21 },
      idleRight: { from: 7, to: 7 },
      idleUp: { from: 0, to: 0 },
      idleDown: { from: 14, to: 14 },
  
      //move
      moveLeft: { from: 22 , to: 27  },
      moveRigth: { from: 8, to: 13 },
      moveUp: { from: 1, to: 6 },
      moveDown: { from: 15, to: 20 },    
    }
  });

  
  loadSprite('bomba', "R4WlvHZ.png", {
    sliceX: 4,
    sliceY: 3,
    anims: {
      //stoped
      idleLeft: { from: 1, to: 1 },
      idleRight: { from: 1, to: 1 },
      idleUp: { from: 1, to: 1 },
      idleDown: { from: 1, to: 1 }, 
      
    }
  });

  loadSprite('boomber', 'etY46bP.png', {
    sliceX: 3,
  
    anims: {
      move: { from: 0, to: 2 },
    }
  })
  
  loadSprite('baloon', 'z59lNU0.png', { sliceX: 3 })
  loadSprite('ghost', '6YV0Zas.png', { sliceX: 3 })
  loadSprite('slime', 'c1Vj0j1.png', { sliceX: 3 })
  
  loadSprite('explosion', 'baBxoqs.png', { 
    sliceX: 5,
    sliceY: 5,
  })
  
  
  scene('game', ({level, score}) => {
    layers(['bg', 'obj', 'ui'], 'obj');
    const levelCfg = {
      width: 26,
      height: 26,
      a: [sprite('wall-steel'), 'wall-steel', solid(), 'wall'],
      z: [sprite('brick-red'), 'wall-brick', solid(), 'wall'],
      r: [sprite('brick-red'), 'wall-brick-speed', solid(), 'wall'],
      d: [sprite('brick-red'), 'wall-brick-dool', solid(), 'wall'],
      g: [sprite('bomba'), 'bomba', 'wall', scale(0.7)],   
      u: [sprite('speed'), 'speed', 'wall', scale(0.7)], 
      '}': [sprite('ghost'), 'dangerous', 'ghost', { dir: -1, timer: 0 }],
      '&': [sprite('slime'), 'slime', { dir: -1 }, 'dangerous', { timer: 0 }],    
      '*': [sprite('baloon'), 'baloon', { dir: -1 }, 'dangerous', { timer: 0 }],
    }
  
    const gameLevel = addLevel(maps, levelCfg);
  
    add([sprite('bg'), layer('bg')])
  
  
    const scoreLabel = add([
      text('Score: ' + score),
      pos(400, 30),
      layer('ui'),
      {
        value: score,
      },
      scale(1)
    ])
  
    add([text('Level: ' + parseInt(level + 1)), pos(400, 60), scale(1)])
  
    if (listUsers.length === 1 ) {
      window.location.href = '/gamesolo';
    }
  
    if (listUsers.length === 2 ) {
      players.push(add([
        sprite('bombermanPlayer1', {
          animeSpeed: 0.1,
          frame: 14,
        }),
        pos(20,25),
        { dir: vec2(1,0) },
      ]))
      players.push(add([
        sprite('bombermanPlayer2', {
          animeSpeed: 0.1,
          frame: 14,
        }),
        //pos(50,25),
        pos(340,340),
        { dir: vec2(1,0) },
      ]))
      console.log("adicionou 2");
    }
    if (listUsers === 3 ) {
      
    }
    if (listUsers === 4 ) {
      
    }
  
    //ACTION PLAYER
    /* player.action(() => {
      player.pushOutAll()
    })
  
    keyDown('left', () => {
      player.move(-MOVE_SPEED, 0);
      player.dir = vec2(-1, 0);
    })
  
    keyDown('right', () => {
      player.move(MOVE_SPEED, 0);
      player.dir = vec2(1, 0);
    })
  
    keyDown('up', () => {
      player.move(0, -MOVE_SPEED);
      player.dir = vec2(0, -1);
    })  
  
    keyDown('down', () => {
      player.move(0, MOVE_SPEED);
      player.dir = vec2(0, 1);
    })   
  
    keyPress('left', () => {
      player.play('moveLeft')
    })
  
    keyPress('right', () => {
      player.play('moveRigth')
    })
  
    keyPress('up', () => {
      player.play('moveUp')
    })  
  
    keyPress('down', () => {
      player.play('moveDown')
    }) 
    
    keyRelease('left', () => {
      player.play('idleLeft')
    })
  
    keyRelease('right', () => {
      player.play('idleRight')
    })
    
    keyRelease('up', () => {
      player.play('idleUp')
    })
  
    keyRelease('down', () => {
      player.play('idleDown')
    })
  
    keyPress('space', () => {
      spawnBomber(player.pos.add(player.dir.scale(0)))
    }) */

    
  
    //ACTIONS ENEMY
    action('baloon', (s) => {
        s.pushOutAll();
        s.move(s.dir * ENEMY_SPEED, 0)
        s.timer -= dt()
        if (s.timer <= 0) {
          s.dir = -s.dir
          s.timer = rand(5)
        }
      })
    
    //FUNCTIONS
  
    function spawnKaboom(p, frame){
      const obj = add([
        sprite('explosion', {
          animeSpeed: 0.1,
          frame: frame,
        }),
        pos(p),
        scale(1.5),
        'kaboom'
      ])
  
      obj.pushOutAll();
      wait(0.5, () => {
        destroy(obj);
      })
    }
  
    function spawnBomber(p){
      const obj = add([sprite('boomber'), ('move'), pos(p), scale(1.5), 'bomber']);
      obj.pushOutAll();
      obj.play("move");
  
      wait(4, () => {
        destroy(obj);
  
        obj.dir = vec2(1,0)
        spawnKaboom(obj.pos.add(obj.dir.scale(0)), 12) // center
  
        obj.dir = vec2(0, -1)
        spawnKaboom(obj.pos.add(obj.dir.scale(20)), 2) // up
  
        
        obj.dir = vec2(0, 1)
        spawnKaboom(obj.pos.add(obj.dir.scale(20)), 22) // down
  
        
        obj.dir = vec2(-1, 0)
        spawnKaboom(obj.pos.add(obj.dir.scale(20)), 10) // left
  
        obj.dir = vec2(1, 0)
        spawnKaboom(obj.pos.add(obj.dir.scale(20)), 14) // rigth
  
      })
    }
  
    
    collides('kaboom', 'dangerous', (k,s) => {
      camShake(4);
       wait(1, () => {
         destroy(k)
       })
       destroy(s);
       scoreLabel.value++
       scoreLabel.text = 'Score: ' + scoreLabel.value
    })
  
  
    collides('kaboom', 'wall-brick', (k,s) => {
      camShake(4);
       wait(1, () => {
         destroy(k)
       })
       destroy(s);
    })

    
  
    collides('kaboom', 'wall-brick-dool', (k,s) => {
      camShake(4);
      wait(1, () => {
        destroy(k);
      })
      destroy(s);
      gameLevel.spawn('g', s.gridPos.sub(0,0))
    })

    collides('kaboom', 'wall-brick-speed', (k,s) => {
        camShake(4);
        wait(1, () => {
          destroy(k);
        })
        destroy(s);
        gameLevel.spawn('u', s.gridPos.sub(0,0))
    })
    
    
    //setInterval(down, 100);
  
      
  })

  scene('lose', ( { score } ) => {
    add([text('Score: '+ score, 32), origin('center'), pos(width() / 2, height() / 2)])
  
    keyPress('space', () => {
      go('game', { level: 0, score: 0 });
    })
  })
  go('game', { level: 0, score: 0 });
});

