const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const clearBtn = document.getElementById("clearBtn");

const SIZE = 9;

let board = Array(SIZE).fill(null);
let currentPlayer = "X";
let gameOver = false;

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

    btn.addEventListener("click", () => {
      handleMove(i);
      // after click move, keep keyboard usable too
      focusNextPlayable(i);
    });

    btn.addEventListener("focus", () => {
      focusIndex = i;
    });

    boardEl.appendChild(btn);
  }

  // Make the board itself focusable (helps keep keyboard active)
  boardEl.tabIndex = 0;
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
  if (gameOver) return false;
  if (board[index] !== null) return false;

  board[index] = currentPlayer;
  currentPlayer = currentPlayer === "X" ? "O" : "X";

  render();
  return true;
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

function restartGame() {
  board = Array(SIZE).fill(null);
  currentPlayer = "X";
  gameOver = false;
  render();
  focusNextPlayable(0);
}

function focusCell(index) {
  const cells = boardEl.querySelectorAll(".cell");
  const safeIndex = Math.max(0, Math.min(SIZE - 1, index));
  focusIndex = safeIndex;

  if (cells[safeIndex] && !cells[safeIndex].disabled) {
    cells[safeIndex].focus();
  } else {
    boardEl.focus();
  }
}

function focusNextPlayable(startIndex) {
  const cells = boardEl.querySelectorAll(".cell");
  if (gameOver) {
    boardEl.focus();
    return;
  }

  for (let offset = 1; offset <= SIZE; offset++) {
    const idx = (startIndex + offset) % SIZE;
    if (board[idx] === null && cells[idx] && !cells[idx].disabled) {
      focusCell(idx);
      return;
    }
  }

  boardEl.focus();
}

function onKeyDown(e) {
  const key = e.key.toLowerCase();

  if (key === "r") {
    e.preventDefault();
    restartGame();
    return;
  }

  const active = document.activeElement;
  const focusInBoard =
    active === boardEl || (active && boardEl.contains(active));

  if (!focusInBoard) return;

  let next = focusIndex;

  if (key === "arrowleft") next = (focusIndex % 3 === 0) ? focusIndex : focusIndex - 1;
  if (key === "arrowright") next = (focusIndex % 3 === 2) ? focusIndex : focusIndex + 1;
  if (key === "arrowup") next = (focusIndex - 3 < 0) ? focusIndex : focusIndex - 3;
  if (key === "arrowdown") next = (focusIndex + 3 > 8) ? focusIndex : focusIndex + 3;

  if (next !== focusIndex) {
    e.preventDefault();
    focusIndex = next;
    focusCell(next);
    return;
  }

  if (key === "enter" || key === " ") {
    e.preventDefault();
    const moved = handleMove(focusIndex);
    if (moved) {
      focusNextPlayable(focusIndex);
    }
  }
}

restartBtn.addEventListener("click", () => restartGame());
clearBtn.addEventListener("click", () => restartGame());

createBoardUI();
render();
focusNextPlayable(0);
document.addEventListener("keydown", onKeyDown);
