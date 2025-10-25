const board = document.getElementById("board");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const aiToggle = document.getElementById("aiToggle");
const difficultySelect = document.getElementById("difficulty");

const xScoreEl = document.getElementById("xScore");
const oScoreEl = document.getElementById("oScore");
const drawEl = document.getElementById("draws");

let currentPlayer = "X";
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let xWins = 0, oWins = 0, draws = 0;

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function createBoard() {
  board.innerHTML = "";
  gameState = ["", "", "", "", "", "", "", "", ""];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleCellClick);
    board.appendChild(cell);
  }
  currentPlayer = "X";
  gameActive = true;
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

restartBtn.addEventListener("click", createBoard);
createBoard();

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || gameState[index] !== "") return;

  makeMove(index, currentPlayer);
  if (checkEnd()) return;

  currentPlayer = currentPlayer === "X" ? "O" : "X";

  if (aiToggle.checked && currentPlayer === "O" && gameActive) {
    setTimeout(aiMove, 500);
  } else {
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function makeMove(index, player) {
  gameState[index] = player;
  const cell = board.querySelector(`[data-index="${index}"]`);
  cell.textContent = player;
}

function checkWin(state = gameState) {
  return winningConditions.some(([a, b, c]) => {
    return state[a] && state[a] === state[b] && state[a] === state[c];
  });
}

function checkEnd() {
  if (checkWin()) {
    statusText.textContent = `Player ${currentPlayer} wins!`;
    updateScore(currentPlayer);
    gameActive = false;
    return true;
  }
  if (gameState.every(c => c !== "")) {
    statusText.textContent = "It's a draw!";
    draws++;
    drawEl.textContent = draws;
    gameActive = false;
    return true;
  }
  return false;
}

function updateScore(winner) {
  if (winner === "X") {
    xWins++;
    xScoreEl.textContent = xWins;
  } else {
    oWins++;
    oScoreEl.textContent = oWins;
  }
}

function aiMove() {
  const difficulty = difficultySelect.value;
  let index;

  if (difficulty === "easy") {
    index = getRandomMove();
  } else if (difficulty === "medium") {
    index = getMediumMove();
  } else {
    index = getBestMove();
  }

  makeMove(index, "O");
  if (checkEnd()) return;
  currentPlayer = "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function getRandomMove() {
  const empty = getEmptyCells();
  return empty[Math.floor(Math.random() * empty.length)];
}

function getMediumMove() {
  for (let i of getEmptyCells()) {
    const temp = [...gameState];
    temp[i] = "O";
    if (checkWin(temp)) return i;
  }
  for (let i of getEmptyCells()) {
    const temp = [...gameState];
    temp[i] = "X";
    if (checkWin(temp)) return i;
  }
  return getRandomMove();
}

function getBestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i of getEmptyCells()) {
    gameState[i] = "O";
    const score = minimax(gameState, 0, false);
    gameState[i] = "";
    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  return move;
}

function minimax(state, depth, isMaximizing) {
  if (checkWin(state)) return isMaximizing ? -1 : 1;
  if (state.every(c => c !== "")) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i of getEmptyCells(state)) {
      state[i] = "O";
      best = Math.max(best, minimax(state, depth + 1, false));
      state[i] = "";
    }
    return best;
  } else {
    let best = Infinity;
    for (let i of getEmptyCells(state)) {
      state[i] = "X";
      best = Math.min(best, minimax(state, depth + 1, true));
      state[i] = "";
    }
    return best;
  }
}

function getEmptyCells(state = gameState) {
  return state.map((val, i) => (val === "" ? i : null)).filter(i => i !== null);
}
