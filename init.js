import { getBlackTokens, getWhiteTokens } from "./winCheck.js";

export const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext('2d');

export function createBoard() {
    let board = [];
    for (let i = 0; i < 18; i++) {
        let row = [];
        for (let j = 0; j < 18; j++) {
            row.push(0);
        }
        board.push(row);
    }
    return board;
}

export function resetBoard() {
    for (let i = 0; i < 18; i++) {
        for (let j = 0; j < 18; j++) {
            board[i][j] = 0;
        }
    }
}

export let board = createBoard();

const woodBg = new Image();
woodBg.src = "wood.jpeg";
woodBg.onload = () => drawBoard();

export const figure = {
    left: 0,
    middle: 1,
    right: 0,
    status: 0
};

export let highlight = { x: 0, y: 0 };

export let selected = { x: -1, y: -1 };

export let playerColors = { 1: "#000000", 2: "#ffffff" };

export const LEFT_WINDOW = { x: 40, y: 380, w: 80, h: 40 };
export const RIGHT_WINDOW = { x: 240, y: 380, w: 80, h: 40 };

function drawWindow(win, state, count, label, textX) {
    if (state === 0) return;
    if (state === 2) {
        ctx.fillStyle = "red";
        ctx.fillRect(win.x, win.y, win.w, win.h);
        ctx.strokeStyle = "#f5e6c8";
        ctx.strokeRect(win.x, win.y, win.w, win.h);
        ctx.fillStyle = "white";
        ctx.fillText("Draw?", textX, 400);
    } else {
        ctx.strokeStyle = "#f5e6c8";
        ctx.strokeRect(win.x, win.y, win.w, win.h);
        ctx.fillStyle = "#f5e6c8";
        ctx.fillText(`${count} ${label}`, textX, 400);
    }
}

export function drawBoard() {
    ctx.clearRect(0, 0, 500, 500);

    if (woodBg.complete) {
        ctx.save();
        ctx.filter = "brightness(1.3) contrast(0.9)";
        ctx.drawImage(woodBg, 0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    const blackCount = getBlackTokens(board);
    const whiteCount = getWhiteTokens(board);
    const blackCapped = blackCount >= 100;
    const whiteCapped = whiteCount >= 100;
    const isBlacksTurn = figure.middle === 1;
    const isWhitesTurn = figure.middle === 2;

    figure.left = blackCount === 0 ? 0 : (blackCapped && isBlacksTurn ? 2 : 1);
    figure.right = whiteCount === 0 ? 0 : (whiteCapped && isWhitesTurn ? 2 : 1);

    // Grid
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    for (let i = 0; i < 17; i++) {
        for (let j = 0; j < 17; j++) {
            ctx.strokeRect(j * 20 + 10, i * 20 + 10, 20, 20);
        }
    }

    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    drawWindow(LEFT_WINDOW, figure.left, blackCount, "Player 1", 80);
    drawWindow(RIGHT_WINDOW, figure.right, whiteCount, "Player 2", 280);

    // Centered turn indicator
    if (figure.status === 0) {
        ctx.beginPath();
        ctx.arc(180, 396, 15, 0, Math.PI * 2);
        ctx.fillStyle = playerColors[figure.middle];
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.stroke();

     ctx.fillStyle = "#f5e6c8";
        ctx.font = "12px Arial";
        ctx.fillText(figure.middle === 1 ? "Player 1's Turn" : "Player 2's Turn", 180, 428);
        ctx.font = "14px Arial";
    }

    const activeCapped = figure.middle === 1 ? figure.left === 2 : figure.right === 2;
    let canHighlight = figure.status === 0 && board[highlight.y][highlight.x] === 0;
    if (canHighlight && activeCapped) {
        canHighlight = selected.x !== -1 &&
            ((Math.abs(highlight.x - selected.x) === 1 && highlight.y === selected.y) ||
             (Math.abs(highlight.y - selected.y) === 1 && highlight.x === selected.x));
    }

    if (canHighlight) board[highlight.y][highlight.x] = 3;
    drawTokens();
    if (canHighlight) board[highlight.y][highlight.x] = 0;

    // Ring around a piece picked up for an orthogonal move
    if (selected.x !== -1) {
        ctx.beginPath();
        ctx.arc(selected.x * 20 + 10, selected.y * 20 + 10, 9, 0, Math.PI * 2);
        ctx.strokeStyle = "#FF8C00";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Win / Draw banner
    const undoBtn = document.getElementById("undo-btn");
    if (undoBtn) undoBtn.disabled = figure.status !== 0;

    if (figure.status !== 0) {
        ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
        ctx.fillRect(0, 0, 360, 40);
        ctx.strokeRect(0, 0, 360, 40);

        ctx.fillStyle = "black";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const message = figure.status === 3 ? "Draw!" : (figure.status === 1 ? "Player 1 Wins!" : "Player 2 Wins!");
        ctx.fillText(message, 180, 20);
    }

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

export function drawTokens() {
    if (!board) return;
    for (let i = 0; i < 18; i++) {
        for (let j = 0; j < 18; j++) {
            const v = board[i][j];
            if (v === 1 || v === 2) {
                ctx.beginPath();
                ctx.arc(j * 20 + 10, i * 20 + 10, 7.5, 0, Math.PI * 2);
                ctx.fillStyle = playerColors[v];
                ctx.fill();
                ctx.stroke();
            } else if (v === 3) {
                ctx.beginPath();
                ctx.arc(j * 20 + 10, i * 20 + 10, 7.5, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 215, 0, 0.6)";
                ctx.fill();
                ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
}
