import { figure, drawBoard, resetBoard, board, highlight, selected, LEFT_WINDOW, RIGHT_WINDOW } from "./init.js";
import { checkWin, getBlackTokens, getWhiteTokens } from "./winCheck.js";
import { recordGameResult, currentPlayers } from "./stats.js";

const track = new Audio('click.mp3');

let moveHistory = [];

function snapshotState() {
    return {
        board: board.map(row => row.slice()),
        middle: figure.middle,
        status: figure.status
    };
}

export function undoMove() {

    if (figure.status !== 0) return;
    if (moveHistory.length === 0) return;

    const prev = moveHistory.pop();

    for (let i = 0; i < 18; i++) {
        for (let j = 0; j < 18; j++) {
            board[i][j] = prev.board[i][j];
        }
    }

    figure.middle = prev.middle;
    figure.status = prev.status;

    drawBoard();
}

export function newGame() {
    resetBoard();

    figure.middle = 1;
    figure.status = 0;
    selected.x = -1;
    selected.y = -1;
    highlight.x = 0;
    highlight.y = 0;
    moveHistory = [];

    drawBoard();
}

export function saveAndCloseGame() {
    if (!currentPlayers.black || !currentPlayers.white) {
        alert("Start a game before saving.");
        return;
    }

    const key = `gomoku_save_${currentPlayers.black}_${currentPlayers.white}`;
    localStorage.setItem(key, JSON.stringify(snapshotState()));

    window.close();

    setTimeout(() => {
        alert("Game saved. You can close this tab now.");
    }, 300);
}

export function loadSavedGame() {
    if (!currentPlayers.black || !currentPlayers.white) return false;

    const key = `gomoku_save_${currentPlayers.black}_${currentPlayers.white}`;
    const data = localStorage.getItem(key);
    if (!data) return false;

    let state;
    try {
        state = JSON.parse(data);
    } catch {
        return false;
    }
    if (!state || !state.board) return false;

    for (let i = 0; i < 18; i++) {
        for (let j = 0; j < 18; j++) {
            board[i][j] = state.board[i][j];
        }
    }

    figure.middle = (state.middle === 1 || state.middle === 2)
        ? state.middle
        : inferTurnFromBoard();
    figure.status = normalizeStatus(state);

    selected.x = -1;
    selected.y = -1;
    highlight.x = 0;
    highlight.y = 0;
    moveHistory = [];

    return true;
}

function inferTurnFromBoard() {
    const black = getBlackTokens(board);
    const white = getWhiteTokens(board);
    return black > white ? 2 : 1;
}

function normalizeStatus(state) {
    if (typeof state.status === "number") return state.status;
    if (typeof state.statusState !== "number" || state.statusState === 0) return 0;
    if (state.statusState === 2) return 3; // old draw encoding
    return state.statusWinner || 0; // old win encoding
}

function isInside(px, py, box) {
    return px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h;
}

function offerDraw(offeredByColor) {
    const name = offeredByColor === 1 ? "Player 1" : "Player 2";
    if (window.confirm(`${name} is offering a draw. Does the opponent accept?`)) {
        figure.status = 3;
    }
    drawBoard();
}

function handleNewPlacement(x, y, player) {
    if (board[y][x] !== 0) return;

    moveHistory.push(snapshotState());
    board[y][x] = player;

    if (checkWin(board, x, y, player)) {
        figure.status = player; // status 1/2 doubles as "that player won"
        recordGameResult(player);
    } else {
        figure.middle = player === 1 ? 2 : 1;
    }

    track.play();
    drawBoard();
}

function handleCappedMove(x, y, player) {
    if (selected.x === -1) {
        if (board[y][x] === player) {
            selected.x = x;
            selected.y = y;
            drawBoard();
        }
        return;
    }

    if (board[y][x] === player) {
        selected.x = x; // re-select a different piece
        selected.y = y;
        drawBoard();
        return;
    }

    const dx = Math.abs(x - selected.x);
    const dy = Math.abs(y - selected.y);
    const orthogonal = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);

    if (orthogonal && board[y][x] === 0) {
        moveHistory.push(snapshotState());
        board[selected.y][selected.x] = 0;
        board[y][x] = player;

        if (checkWin(board, x, y, player)) {
            figure.status = player;
            recordGameResult(player);
        } else {
            figure.middle = player === 1 ? 2 : 1;
        }
        track.play();
    }

    selected.x = -1;
    selected.y = -1;
    drawBoard();
}

function placeAtHighlight() {
    const player = figure.middle;
    const activeCapped = player === 1 ? figure.left === 2 : figure.right === 2;

    if (activeCapped) {
        handleCappedMove(highlight.x, highlight.y, player);
    } else {
        handleNewPlacement(highlight.x, highlight.y, player);
    }
}

export function click(event) {
    if (figure.status !== 0) return;

    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    if (figure.left === 2 && isInside(mouseX, mouseY, LEFT_WINDOW)) return offerDraw(1);
    if (figure.right === 2 && isInside(mouseX, mouseY, RIGHT_WINDOW)) return offerDraw(2);

    const x = Math.floor(mouseX / 20);
    const y = Math.floor(mouseY / 20);
    if (x < 0 || x >= 18 || y < 0 || y >= 18) return;

    highlight.x = x;
    highlight.y = y;
    placeAtHighlight();
}

export function hover(event) {
    if (figure.status !== 0) return;

    const x = Math.floor(event.offsetX / 20);
    const y = Math.floor(event.offsetY / 20);

    if (x >= 0 && x < 18 && y >= 0 && y < 18) {
        highlight.x = x;
        highlight.y = y;
        drawBoard();
    }
}

// WASD moves the highlighted cell; Enter/Space places or moves there —
// the same action a click on that cell would trigger.
export function handleKeyDown(event) {
    if (figure.status !== 0) return;

    const key = event.key.toLowerCase();

    if (key === "w") highlight.y = Math.max(0, highlight.y - 1);
    else if (key === "s") highlight.y = Math.min(17, highlight.y + 1);
    else if (key === "a") highlight.x = Math.max(0, highlight.x - 1);
    else if (key === "d") highlight.x = Math.min(17, highlight.x + 1);
    else if (key === "enter" || key === " ") return placeAtHighlight();
    else return;

    drawBoard();
}
