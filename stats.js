export let currentPlayers = { black: "", white: "" };

// Retrieve stats from localStorage or create a fresh profile
export function getPlayerStats(username) {
    if (!username) return null;
    const data = localStorage.getItem(`gomoku_${username}`);
    if (data) {
        const stats = JSON.parse(data);
        // Migrate profiles saved under the old winsBlack/winsWhite
        // schema, or any record missing a usable wins/played number.
        if (typeof stats.wins !== "number") {
            stats.wins = (stats.winsBlack || 0) + (stats.winsWhite || 0);
        }
        if (typeof stats.played !== "number") {
            stats.played = 0;
        }
        return stats;
    }
    return { played: 0, wins: 0 };
}

// Save stats back to localStorage
export function savePlayerStats(username, stats) {
    if (!username) return;
    localStorage.setItem(`gomoku_${username}`, JSON.stringify(stats));
}

// Update stats when the game ends. winner: 1 (Black), 2 (White), 0 (Draw)
// Each player's win count is personal to them, not tied to which color they played.
export function recordGameResult(winner) {
    if (currentPlayers.black) {
        let bStats = getPlayerStats(currentPlayers.black);
        bStats.played++;
        if (winner === 1) bStats.wins++;
        savePlayerStats(currentPlayers.black, bStats);
    }

    if (currentPlayers.white) {
        let wStats = getPlayerStats(currentPlayers.white);
        wStats.played++;
        if (winner === 2) wStats.wins++;
        savePlayerStats(currentPlayers.white, wStats);
    }

    updateScoreboardUI();
}

// Refresh the UI to show the latest stats
export function updateScoreboardUI() {
    const bStats = getPlayerStats(currentPlayers.black);
    const wStats = getPlayerStats(currentPlayers.white);

    if (bStats) {
        document.getElementById("black-name-display").innerText = `Player 1: ${currentPlayers.black}`;
        document.getElementById("black-stats-display").innerText = `Wins: ${bStats.wins} | Played: ${bStats.played}`;
    }
    if (wStats) {
        document.getElementById("white-name-display").innerText = `Player 2: ${currentPlayers.white}`;
        document.getElementById("white-stats-display").innerText = `Wins: ${wStats.wins} | Played: ${wStats.played}`;
    }
}