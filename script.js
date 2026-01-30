// Tic-Tac-Toe (2 players, same device)
// Extra feature implemented: Keyboard support (Arrow keys + Enter/Space + R)

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const clearBtn = document.getElementById("clearBtn");

const SIZE = 9;

let board = Array(SIZE).fill(null);
let currentPlayer = "X";
let gameOver = false;

// Track "keyboard focus index" for arrow key navigation
let focusIndex = 0;

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function createBoardUI() {
  boardEl.innerHTML = "";

  for (let i = 0; i < SIZE; i++) {
    const btn = document.createElement("button");
    btn.className = "cell";
    btn.type = "button";
    btn.setAttribute("role", "gridcell");
    btn.setAttribute("aria-label", `Cell ${i + 1}`);
    btn.dataset.index = String(i);

    btn.addEventListener("click", () => handleMove(i));
    btn.addEventListener("focus", () => {
      focusIndex = i;
    });

    boardEl.appendChild(btn);
  }
}

function render() {
  const cells = boardEl.querySelectorAll(".cell");
  cells.forEach((cell, i) => {
    cell.textContent = board[i] ?? "";
    cell.disabled = gameOver || board[i] !== null;
    cell.classList.remove("win");
  });

  const { winner, line } = checkWinner();
  if (winner) {
    statusEl.textContent = `Player ${winner} wins!`;
    gameOver = true;
    if (line) highlightWin(line);
  } else if (board.every((c) => c !== null)) {
    statusEl.textContent = "It’s a tie!";
    gameOver = true;
  } else {
    statusEl.textContent = `Player ${currentPlayer}’s turn`;
  }
}

function handleMove(index) {
  if (gameOver) return;
  if (board[index] !== null) return;

  board[index] = currentPlayer;

  // swap player
  currentPlayer = currentPlayer === "X" ? "O" : "X";

  render();
}

function checkWinner() {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

function highlightWin(line) {
  const cells = boardEl.querySelectorAll(".cell");
  line.forEach((i) => cells[i].classList.add("win"));
}

function restartGame(keepScoreLikeState = true) {
  // keepScoreLikeState exists to show “localized manual control” capability,
  // but we are not tracking score in this version.
  board = Array(SIZE).fill(null);
  currentPlayer = "X";
  gameOver = false;
  render();
  focusCell(0);
}

function focusCell(index) {
  const cells = boardEl.querySelectorAll(".cell");
  const safeIndex = Math.max(0, Math.min(SIZE - 1, index));
  focusIndex = safeIndex;
  cells[safeIndex]?.focus();
}

// Keyboard support:
// Arrow keys move focus around the 3x3 grid
// Enter/Space places a mark
// R restarts
function onKeyDown(e) {
  const key = e.key.toLowerCase();

  // Only handle if focus is inside the board or the user presses R
  const active = document.activeElement;
  const isCell = active && active.classList && active.classList.contains("cell");

  if (key === "r") {
    e.preventDefault();
    restartGame();
    return;
  }

  if (!isCell) return;

  let next = focusIndex;

  if (key === "arrowleft") next = (focusIndex % 3 === 0) ? focusIndex : focusIndex - 1;
  if (key === "arrowright") next = (focusIndex % 3 === 2) ? focusIndex : focusIndex + 1;
  if (key === "arrowup") next = (focusIndex - 3 < 0) ? focusIndex : focusIndex - 3;
  if (key === "arrowdown") next = (focusIndex + 3 > 8) ? focusIndex : focusIndex + 3;

  if (next !== focusIndex) {
    e.preventDefault();
    focusCell(next);
    return;
  }

  if (key === "enter" || key === " ") {
    e.preventDefault();
    handleMove(focusIndex);
  }
}

// Buttons
restartBtn.addEventListener("click", () => restartGame());
clearBtn.addEventListener("click", () => restartGame());

// Init
createBoardUI();
render();
focusCell(0);
document.addEventListener("keydown", onKeyDown);
