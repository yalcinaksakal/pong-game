// Canvas
const { body } = document;
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

const width = window.innerWidth * 0.9 > 500 ? 500 : window.innerWidth * 0.9;
const height = window.innerHeight - 20;

//
const canvasPosition = width === 500 ? window.innerWidth / 2 - 250 : width / 18; // w/18=%5

const gameOverEl = document.createElement("div");

// Paddle
const paddleHeight = 10;
const paddleWidth = 80;
const paddleDiff = 25;
let paddleBottomX = width / 2 - 25;
let paddleTopX = width / 2 - 25;

let paddleContact = false;

// Ball
let ballX;
let ballY;
const ballRadius = 6;

// Speed
let speedY = -1;
let speedX = -1;
let trajectoryX;
let computerSpeed = 4;

// Score
let playerScore = 0;
let computerScore = 0;
const winningScore = 7;
let isGameOver = true;
let isNewGame = true;

// Render Everything on Canvas
function renderCanvas(color = "white") {
  // Canvas Background
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);
  // Paddle Color
  context.fillStyle = "dodgerblue";
  // Player Paddle (Bottom)
  context.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);
  // Computer Paddle (Top)
  context.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);
  // Dashed Center Line
  context.beginPath();
  context.setLineDash([2]);
  context.moveTo(0, height / 2);
  context.lineTo(width, height / 2);
  context.strokeStyle = "green";
  context.stroke();
  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
  //Score;
  context.font = "32px Courier New";
  context.fillText(playerScore, 20, canvas.height / 2 + 50);
  context.fillText(computerScore, 20, canvas.height / 2 - 30);
}

// Create Canvas Element
function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  body.appendChild(canvas);
  renderCanvas();
}

// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -3;
  paddleContact = false;
}

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += -speedY;
  // Horizontal Speed
  if (paddleContact) {
    ballX += speedX;
  }
}
let stopAnimate = false;
function scored() {
  renderCanvas("dodgerblue");
  stopAnimate = true;
  setTimeout(() => {
    stopAnimate = false;
    ballReset();
    animate();
  }, 1000);
}

function scoreChecker(paddleX, speedChange) {
  //if touching to paddle
  if (
    ballX + ballRadius > paddleX &&
    ballX - ballRadius < paddleX + paddleWidth
  ) {
    paddleContact = true;
    // Add Speed on Hit

    speedY += speedChange;
    // Max Speed
    if (speedY < 8 * speedChange) {
      speedY = 8 * speedChange;
      computerSpeed = 8;
    }

    speedY = -speedY;
    if (speedChange === -1) {
      trajectoryX = ballX - (paddleX + paddleDiff);
      speedX = trajectoryX * 0.3;
    }
  } else {
    // Reset Ball, add to Computer Score
    speedChange === -1 ? computerScore++ : playerScore++;
    scored();
    gameOver(); ///check if game is over
  }
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX - ballRadius < 0 && speedX < 0) {
    speedX = -speedX;
    return;
  }
  // Bounce off Right Wall
  if (ballX + ballRadius > width && speedX > 0) {
    speedX = -speedX;
    return;
  }
  // Bounce off player paddle (bottom)
  //height - 20 is Y cord of top left of player paddle
  if (ballY + ballRadius > height - 20) scoreChecker(paddleBottomX, -1);
  // Bounce off computer paddle (top)
  if (ballY < paddleHeight + 10) scoreChecker(paddleTopX, 1);
}

const quickchecker = x => x > 0 && x + paddleWidth < width;
// Computer Movement
function computerAI() {
  if (
    ballX + ballRadius > paddleTopX + paddleDiff &&
    ballX - ballRadius < paddleTopX - paddleDiff + paddleWidth
  )
    return;

  if (paddleTopX + paddleDiff < ballX) {
    if (quickchecker(paddleTopX + computerSpeed)) paddleTopX += computerSpeed;
  } else {
    if (quickchecker(paddleTopX - computerSpeed)) paddleTopX -= computerSpeed;
  }
}

function showGameOverEl(winner) {
  //Hide Canvas
  canvas.hidden = true;
  // Container
  gameOverEl.textContent = "";
  gameOverEl.classList.add("game-over-container");
  // Title
  const title = document.createElement("h1");
  title.textContent = `${winner} Wins!`;
  // Button
  const playAgainBtn = document.createElement("button");
  playAgainBtn.setAttribute("onclick", "startGame()");
  playAgainBtn.textContent = "Play Again";
  // Append
  gameOverEl.append(title, playAgainBtn);
  body.appendChild(gameOverEl);
}

// Check If One Player Has Winning Score, If They Do, End Game
function gameOver() {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true;
    // Set Winner
    setTimeout(
      () =>
        showGameOverEl(playerScore === winningScore ? "Player 1" : "Computer"),
      2500
    );
  }
}

// Called Every Frame
function animate() {
  if (!stopAnimate) {
    renderCanvas();
    ballMove();
    ballBoundaries();
    computerAI();
    if (!isGameOver) window.requestAnimationFrame(animate);
  }
}

// Start Game, Reset Everything
function startGame() {
  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverEl);
    canvas.hidden = false;
  }
  isGameOver = false;
  isNewGame = false;
  playerScore = 0;
  computerScore = 0;
  ballReset();
  createCanvas();
  animate();

  canvas.addEventListener("mousemove", e => {
    // Compensate for canvas being centered
    paddleBottomX =
      e.clientX - canvasPosition > 0 &&
      e.clientX - canvasPosition < width - paddleWidth
        ? e.clientX - canvasPosition
        : paddleBottomX;

    // Hide Cursor
    //canvas.style.cursor = "none";
  });
}

// On Load
startGame();
