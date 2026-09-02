import { canvas, drawBoard, playerColors } from "./init.js";
import { click, hover, undoMove, newGame, saveAndCloseGame, loadSavedGame, handleKeyDown } from "./user.js";
import { currentPlayers, updateScoreboardUI } from "./stats.js";

canvas.addEventListener("click", click);
canvas.addEventListener("mousemove", hover);

document.getElementById("undo-btn").addEventListener("click", undoMove);
document.getElementById("new-game-btn").addEventListener("click", newGame);
document.getElementById("save-btn").addEventListener("click", saveAndCloseGame);

// Piece color pickers (sidebar)
document.getElementById("black-color-input").addEventListener("input", (e) => {
    playerColors[1] = e.target.value;
    drawBoard();
});
document.getElementById("white-color-input").addEventListener("input", (e) => {
    playerColors[2] = e.target.value;
    drawBoard();
});

const loginWrapper = document.getElementById("login-wrapper");
const loginForm = document.getElementById("login-form");
const scoreboard = document.getElementById("scoreboard");
const player1Input = document.getElementById("player1-username");
const player2Input = document.getElementById("player2-username");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const blackName = player1Input.value.trim();
    const whiteName = player2Input.value.trim();

    if (!blackName || !whiteName) {
        alert("Please enter a name for both players.");
        return;
    }

    currentPlayers.black = blackName;
    currentPlayers.white = whiteName;

    loadSavedGame();

    loginWrapper.classList.add("hidden");
    scoreboard.classList.remove("hidden");

    updateScoreboardUI();
    drawBoard();
});

window.addEventListener("keydown", (event) => {
    if (event.target.tagName === "INPUT" || !loginWrapper.classList.contains("hidden")) return;
    handleKeyDown(event);
});

const INSTRUCTIONS = [
    "Click an empty cell to place your piece. Player 1 moves first.",
    "Get five in a row: horizontally, vertically, or diagonally to win.",
    "Once a color places 100 pieces, it can no longer add new ones. Click one of its pieces, then an adjacent empty cell, to move it instead. Click a capped color's \"Draw?\" window any time to offer a draw.",
    "No mouse needed: W/A/S/D moves the highlighted cell and Enter/Space places or moves it. Undo, New Game, and Save and Close Game are below the board; piece colors are in this menu."
];

let instructionsPage = 0;
const instructionsWrapper = document.getElementById("instructions-wrapper");
const instructionsText = document.getElementById("instructions-text");
const instructionsBack = document.getElementById("instructions-back");
const instructionsNext = document.getElementById("instructions-next");

function renderInstructions() {
    instructionsText.textContent = INSTRUCTIONS[instructionsPage];
    instructionsBack.disabled = instructionsPage === 0;
    instructionsNext.textContent = instructionsPage === INSTRUCTIONS.length - 1 ? "I Understand" : "Next";
}

function openInstructions() {
    instructionsPage = 0;
    renderInstructions();
    instructionsWrapper.classList.remove("hidden");
}

instructionsBack.addEventListener("click", () => {
    if (instructionsPage > 0) {
        instructionsPage--;
        renderInstructions();
    }
});

instructionsNext.addEventListener("click", () => {
    if (instructionsPage < INSTRUCTIONS.length - 1) {
        instructionsPage++;
        renderInstructions();
    } else {
        instructionsWrapper.classList.add("hidden");
        localStorage.setItem("gomoku_seen_instructions", "1");
    }
});

document.getElementById("how-to-play-link").addEventListener("click", (e) => {
    e.preventDefault();
    openInstructions();
});

if (!localStorage.getItem("gomoku_seen_instructions")) {
    openInstructions();
}

drawBoard();
