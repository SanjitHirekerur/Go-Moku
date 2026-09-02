export function getWhiteTokens(board) {
    let white = 0;
    if (!board) return 0;
    for (let i = 0; i < 18; i++) {
        for (let j = 0; j < 18; j++) {
            if (board[i][j] === 2) {
                white++;
            }
        }
    }
    return white;
}

export function getBlackTokens(board) {
    let black = 0;
    if (!board) return 0;
    for (let i = 0; i < 18; i++) {
        for (let j = 0; j < 18; j++) {
            if (board[i][j] === 1) {
                black++;
            }
        }
    }
    return black;
}

const DIRECTIONS = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
];

export function checkWin(board, x, y, player) {
    if (!board) return false;

    for (const { dx, dy } of DIRECTIONS) {
        let count = 1;

        let nx = x + dx, ny = y + dy;
        while (nx >= 0 && nx < 18 && ny >= 0 && ny < 18 && board[ny][nx] === player) {
            count++;
            nx += dx;
            ny += dy;
        }

        nx = x - dx; ny = y - dy;
        while (nx >= 0 && nx < 18 && ny >= 0 && ny < 18 && board[ny][nx] === player) {
            count++;
            nx -= dx;
            ny -= dy;
        }

        if (count >= 5) return true;
    }

    return false;
}

export function checkDraw(board) {
    return getWhiteTokens(board) + getBlackTokens(board) >= 200;
}