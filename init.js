var keyList = {};

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
  get width() {
    return this.canvas.width;
  },
  get height() {
    return this.canvas.height;
  },
  get ctx() {
    return this.canvas.getContext('2d');
  },
  isCollide: function() {
    var i = 0;
    var playerLeft = player.x;
    var playerRight = player.x + player.width;
    var playerTop = player.y;
    var playerBottom = player.y + player.height;

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
  speed: 1,
  baseWidth: 30,
  minGap: 80,
  maxGap: 150,
  minHeight: 30,
  maxHeight: 70,
  prevGenerateTime: 0,
  generateWaitMilliseconds: 5000,
  init: function() {
    this.obstacles.splice(0, this.obstacles.length);
    this.speed = 1;
    this.baseWidth = 30;
    this.minGap = 80;
    this.maxGap = 150;
    this.minHeight = 30;
    this.maxHeight = 70;
    this.prevGenerateTime = 0;
    this.gnerateWaitMilliseconds = 5000;
  },
  generate: function() {
    elapsed = Date.now() - this.prevGenerateTime;
    if (elapsed > this.generateWaitMilliseconds) {
      var gap = Math.floor(Math.random() * (this.maxGap - this.minGap + 1) + this.minGap);
      var height = Math.floor(Math.random() * (this.maxHeight - this.minHeight + 1) + this.minHeight);
      var width = this.baseWidth + 2 * Math.random();

      this.obstacles.push({
        width: width,
        height: height,
        x: gameBoard.width,
        y: 0,
        color: "green"
      });
  
      this.obstacles.push({
        width: width,
        height: gameBoard.width - height - gap,
        x: gameBoard.width,
        y: height + gap,
        color: "green"
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
  width: 30,
  height: 30,
  x: gameBoard.width / 100,
  y: gameBoard.height / 2,
  gravity: 0,
  gravitySpeed: 0.5,
  gravityMin: -5,
  gravityMax: 3,
  speedX: 3,
  timeOfLastHop: 0,
  hopCooldownMilliseconds: 3,
  color: "red",
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
    console.log("you suck.. continue? (y/n)");
    signalCheck();
    function signalCheck() {
      if (keyList['y'] == true) {
        console.log("right on, then!");
        resolve(false);
      } else if (keyList['n'] == true) {
        console.log("coward...");
        resolve(true);
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

(function animate() {
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
          runGame();
        }
      );
      break;
  }
})();