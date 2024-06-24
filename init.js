// Javascript won't allow me to use RNG seeds, so here we go...
// this is from the lovely answer: https://stackoverflow.com/a/47593316
function sfc32(a, b, c, d) {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

const seedgen = () => (Math.random()*2**32)>>>0;
const getRand = sfc32(seedgen(), seedgen(), seedgen(), seedgen());

var keyList = {};

document.getElementsByClassName('game-button')[0].addEventListener('mousedown', (ev) => {
  keyList['ArrowUp'] = true;
}, true);

document.getElementsByClassName('game-button')[0].addEventListener('mouseup', (ev) => {
  keyList['ArrowUp'] = false;
}, true);

document.getElementsByClassName('game-button')[0].addEventListener('touchstart', (ev) => {
  keyList['ArrowUp'] = true;
}, true);

document.getElementsByClassName('game-button')[0].addEventListener('touchend', (ev) => {
  keyList['ArrowUp'] = false;
}, true);

document.addEventListener('keydown', (ev) => {
  keyList[ev.key] = true;
}, true);

document.addEventListener('keyup', (ev) => {
  keyList[ev.key] = false;
}, true);

const GameStates = Object.freeze({
  MAIN_MENU: 0,
  RUNNING_GAME: 1,
  PAUSE_MENU: 2,
  RETRY_MENU: 3,
});

var gameState = {
  score: 0,
  state: GameStates.RUNNING_GAME,
};

var gameBoard = {
  canvas: document.getElementsByClassName('game-canvas')[0],
  width: 0,
  height: 0,
  ctx: null,
  init: function() {
    this.canvas = document.getElementsByClassName('game-canvas')[0];
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ctx = this.canvas.getContext('2d');
  },
  isCollide: function() {
    var i = 0;
    var playerLeft = player.x;
    var playerRight = player.x + player.width;
    var playerTop = player.y;
    var playerBottom = player.y + player.height;

    if (playerBottom >= gameBoard.height) return true;

    for (i = 0; i < gameObstacles.obstacles.length; ++i) {
      var obstacle = gameObstacles.obstacles.at(i);
      var obstacleLeft = obstacle.x;
      var obstacleRight = obstacle.x + obstacle.width;
      var obstacleTop = obstacle.y;
      var obstacleBottom = obstacle.y + obstacle.height;

      if (playerBottom < obstacleTop) continue;
      if (playerTop > obstacleBottom) continue;
      if (playerLeft > obstacleRight) continue;
      if (playerRight < obstacleLeft) continue;
      
      break;
    }

    return i < gameObstacles.obstacles.length == true;
  },
  clear: function() {
    this.ctx.fillStyle = "rgb(200, 200, 200)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },
  update: function() {
    // check first if a collision event occured
    if (this.isCollide()) {
      gameState.state = GameStates.RETRY_MENU;
    } else {
      // clear canvas
      this.clear();
      // draw player
      this.ctx.fillStyle = player.color;
      this.ctx.fillRect(player.x, player.y, player.width, player.height);
      // draw all the obstacles
      for (let i = 0; i < gameObstacles.obstacles.length; ++i) {
        var obstacle = gameObstacles.obstacles.at(i);
        this.ctx.fillStyle = obstacle.color;
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
    }
  }
};

var gameObstacles = {
  obstacles: [],
  speed: 0,
  baseWidth: 0,
  minGap: 0,
  maxGap: 0,
  minHeight: 0,
  maxHeight: 0,
  prevGenerateTime: 0,
  generateWaitMilliseconds: 0,
  color: "",
  init: function() {
    this.obstacles.splice(0, this.obstacles.length);
    this.speed = 1;
    this.baseWidth = 30;
    this.minGap = Math.max(player.height * 2, gameBoard.height * 0.2);
    this.maxGap = Math.max(player.height * 2, gameBoard.height * 0.4);
    this.minHeight = gameBoard.height * 0.1;
    this.maxHeight = gameBoard.height * 0.7;
    this.prevGenerateTime = 0;
    this.generateWaitMilliseconds = 5000;
    this.color = "green";
  },
  generate: function() {
    elapsed = Date.now() - this.prevGenerateTime;
    if (elapsed > this.generateWaitMilliseconds) {
      var gap = Math.floor(getRand() * (this.maxGap - this.minGap + 1) + this.minGap);
      var height = Math.floor(getRand() * (this.maxHeight - this.minHeight + 1) + this.minHeight);
      var width = this.baseWidth + 2 * getRand();

      this.obstacles.push({
        width: width,
        height: height,
        x: gameBoard.width,
        y: 0,
        color: this.color
      });
  
      this.obstacles.push({
        width: width,
        height: gameBoard.width - height - gap,
        x: gameBoard.width,
        y: height + gap,
        color: this.color,
      });

      this.prevGenerateTime = Date.now();
    }
  },
  update: function() {
    var index = 0;
    while (index < this.obstacles.length) {
      let top = this.obstacles.at(index);
      let bottom = this.obstacles.at(index + 1);
      if (top.x < 0 - top.width) {
        this.obstacles.splice(index, 2);
      } else {
        top.x -= this.speed;
        bottom.x -= this.speed;
        index += 2;
      }
    }
    this.generate();
  }
};

var player = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  gravity: 0,
  gravitySpeed: 0,
  gravityMin: 0,
  gravityMax: 0,
  speedX: 0,
  timeOfLastHop: 0,
  hopCooldownMilliseconds: 0,
  color: "",
  init: function() {
    this.width = 30;
    this.height = 30;
    this.x = gameBoard.width / 100;
    this.y = gameBoard.height / 2;
    this.gravity = 0;
    this.gravitySpeed = 0.5;
    this.gravityMin = -5;
    this.gravityMax = 3;
    this.speedX = 3;
    this.timeOfLastHop = 0;
    this.hopCooldownMilliseconds = 3;
    this.color = "red";
  },
  update: function() {
    var isUp = keyList['ArrowUp'] == true || keyList['Enter'] == true || keyList['w'];
    var isLeft = keyList['ArrowLeft'] == true || keyList['a'] == true;
    var isRight = keyList['ArrowRight'] == true || keyList['d'] == true;

    if (isLeft) this.x -= this.speedX;
    if (isRight) this.x += this.speedX;
    if (isUp) {
      elapsed = Date.now() - this.timeOfLastHop;
      console.log(elapsed);
      if (elapsed > this.hopCooldownMilliseconds) {
        this.gravity = this.gravityMax;
        this.timeOfLastHop = Date.now();
      }
    }

    this.y -= this.gravity;
    this.gravity = Math.max(this.gravityMin, this.gravity - this.gravitySpeed);

    if (this.y < 0) {
      this.y = 0;
    } else if (this.y > gameBoard.height - this.height) {
      this.y = gameBoard.height - this.height;
    }

    if (this.x < 0) {
      this.x = 0;
    } else if (this.x > gameBoard.width - this.width) {
      this.x = gameBoard.width - this.width;
    }
  }
}

async function retryMenu() {
  let myPromise = new Promise((resolve) => {
    var gameMenu = document.getElementsByClassName('game-menu')[0];
    var gameMenuMessage = gameMenu.getElementsByTagName('p')[0];
    var gameMenuButton = gameMenu.getElementsByTagName('button')[0];

    gameMenu.style.zIndex = '1';
    gameMenuMessage.innerHTML = "Try again?";
    gameMenuButton.innerHTML = "Retry";
    
    // set event for button
    gameMenuButton.addEventListener("click", () => {
      gameMenu.style.zIndex = '-1';
      resolve(false);
    });

    // set event for key
    signalCheck();
    function signalCheck() {
      if (keyList['Enter'] == true) {
        gameMenu.style.zIndex = '-1';
        resolve(false);
      } else {
        setTimeout(signalCheck, 0);
      }
    }
  });
  return await myPromise;
}

async function mainMenu() {

}

async function pauseMenu() {

}

function animate() {
  function runGame() {
    player.update();
    gameObstacles.update();
    gameBoard.update();
    requestAnimationFrame(animate);
  }
  switch (gameState.state) {
    case GameStates.RUNNING_GAME:
      runGame();
      break;
    case GameStates.RETRY_MENU:
      retryMenu().then(
        function(value) {
          if (value == true) {
            console.log("yep, we gone now..");
            gameBoard.clear();
            return;
          }
          gameState.state = GameStates.RUNNING_GAME;
          player.init();
          gameObstacles.init();
          seedgen();
          runGame();
        }
      );
      break;
  }
}

window.addEventListener('load', () => {
  gameBoard.init();
  player.init();
  gameObstacles.init();
  seedgen();
  animate();
});