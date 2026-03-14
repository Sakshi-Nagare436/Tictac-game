// ================= VARIABLES =================
const cells = document.querySelectorAll(".cell");
const board = document.querySelector(".board");
const statusText = document.getElementById("status");

let currentPlayer = "X";
let gameActive = false;

let gameMode = "player";
let difficulty = "easy";
let soundOn = true;

let player1Name = "";
let player2Name = "";

let score1 = 0;
let score2 = 0;

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// ================= START GAME =================
function startGame() {
    const p1Input = document.getElementById("p1");
    const p2Input = document.getElementById("p2");

    player1Name = p1Input.value.trim();
    player2Name = p2Input.value.trim();

    gameMode = document.getElementById("gameMode").value;
    difficulty = document.getElementById("difficulty").value;

    if (player1Name === "") {
        alert("Please enter Player 1 name first!");
        return;
    }

    if (gameMode === "player") {
        if (player2Name === "") {
            alert("Please enter Player 2 name first!");
            return;
        }
    } else {
        player2Name = "Computer";
    }

    // Show names in game table
    document.getElementById("name1").innerText = player1Name;
    document.getElementById("name2").innerText = player2Name;

    document.getElementById("welcomePage").style.display = "none";
    document.getElementById("gamePage").style.display = "block";

    clearBoard();
    currentPlayer = "X";
    gameActive = true;

    statusText.innerText = `${player1Name} (X) Turn`;

    // Unlock sound on first user click
    unlockSound();
}

// ================= UNLOCK SOUND =================
function unlockSound() {
    const audio = document.getElementById("clickSound");
    if (!audio) return;

    // Try to "prime" audio for browsers
    audio.volume = 1;
    audio.muted = true;

    const promise = audio.play();
    if (promise !== undefined) {
        promise.then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false;
        }).catch(() => {
            audio.muted = false;
        });
    } else {
        audio.muted = false;
    }
}

// ================= PLAY SOUND =================
function playSound() {
    if (!soundOn) return;

    const audio = document.getElementById("clickSound");
    if (!audio) {
        console.log("clickSound audio tag not found");
        return;
    }

    audio.currentTime = 0;
    const promise = audio.play();

    if (promise !== undefined) {
        promise.catch((err) => {
            console.log("Sound blocked or file missing:", err);
        });
    }
}

// ================= CELL CLICK =================
cells.forEach(cell => {
    cell.addEventListener("click", function () {
        if (!gameActive || cell.innerText !== "") return;

        cell.innerText = currentPlayer;
        playSound();

        if (checkWinner()) {
            if (currentPlayer === "X") {
                score1++;
                document.getElementById("score1").innerText = score1;
                statusText.innerText = `${player1Name} Wins!`;
            } else {
                score2++;
                document.getElementById("score2").innerText = score2;
                statusText.innerText = `${player2Name} Wins!`;
            }
            gameActive = false;
            return;
        }

        if (checkDraw()) {
            statusText.innerText = "It's a Draw!";
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusText.innerText = currentPlayer === "X"
            ? `${player1Name} (X) Turn`
            : `${player2Name} (O) Turn`;

        if (gameMode === "computer" && currentPlayer === "O" && gameActive) {
            setTimeout(computerMove, 350);
        }
    });
});

// ================= COMPUTER MOVE =================
function computerMove() {
    if (!gameActive) return;

    const emptyCells = [...cells].filter(cell => cell.innerText === "");
    if (emptyCells.length === 0) return;

    let move;

    if (difficulty === "easy") {
        move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else if (difficulty === "medium") {
        move = findBlockingMove() || emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else {
        move = findBestMove() || emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    move.innerText = "O";
    playSound();

    if (checkWinner()) {
        score2++;
        document.getElementById("score2").innerText = score2;
        statusText.innerText = `${player2Name} Wins!`;
        gameActive = false;
        return;
    }

    if (checkDraw()) {
        statusText.innerText = "It's a Draw!";
        gameActive = false;
        return;
    }

    currentPlayer = "X";
    statusText.innerText = `${player1Name} (X) Turn`;
}

// ================= MEDIUM BLOCK MOVE =================
function findBlockingMove() {
    for (let pattern of winPatterns) {
        const values = pattern.map(i => cells[i].innerText);

        if (values.filter(v => v === "X").length === 2 && values.includes("")) {
            const index = pattern[values.indexOf("")];
            return cells[index];
        }
    }
    return null;
}

// ================= HARD MODE BEST MOVE =================
function findBestMove() {
    // First try winning move
    for (let pattern of winPatterns) {
        const values = pattern.map(i => cells[i].innerText);
        if (values.filter(v => v === "O").length === 2 && values.includes("")) {
            const index = pattern[values.indexOf("")];
            return cells[index];
        }
    }

    // Then block player
    return findBlockingMove();
}

// ================= CHECK WIN =================
function checkWinner() {
    return winPatterns.some(pattern => {
        return pattern.every(index => cells[index].innerText === currentPlayer);
    });
}

// ================= CHECK DRAW =================
function checkDraw() {
    return [...cells].every(cell => cell.innerText !== "");
}

// ================= CLEAR BOARD =================
function clearBoard() {
    cells.forEach(cell => {
        cell.innerText = "";
    });
}

// ================= RESTART GAME =================
function restartGame() {
    clearBoard();
    currentPlayer = "X";
    gameActive = true;
    statusText.innerText = `${player1Name} (X) Turn`;
}

// ================= NEXT ROUND =================
function nextRound() {
    restartGame();
}

// ================= MODE =================
function setMode(mode) {
    gameMode = mode;

    const p2 = document.getElementById("p2");
    const difficultyBox = document.getElementById("difficultyBox");

    if (mode === "computer") {
        p2.value = "";
        p2.placeholder = "Computer will play as O";
        p2.disabled = true;
        difficultyBox.style.display = "block";
    } else {
        p2.disabled = false;
        p2.placeholder = "Enter Player 2 Name";
        difficultyBox.style.display = "block";
    }
}

// ================= DIFFICULTY =================
function setDifficulty(level) {
    difficulty = level;
}

// ================= THEME =================
function setTheme(theme) {
    document.body.classList.remove("light", "dark", "neon");
    document.body.classList.add(theme);
}

// ================= SOUND TOGGLE =================
function toggleSound() {
    soundOn = !soundOn;
    const btn = document.getElementById("soundBtn");
    btn.innerText = soundOn ? "🔊 Sound On" : "🔇 Sound Off";
}

// ================= BACK =================
function goBack() {
    document.getElementById("gamePage").style.display = "none";
    document.getElementById("welcomePage").style.display = "flex";
    document.getElementById("winnerPopup").style.display = "none";
}

// ================= POPUP BACK =================
function goBackFromPopup() {
    document.getElementById("winnerPopup").style.display = "none";
    goBack();
}

// ================= INIT =================
window.onload = function () {
    setMode(document.getElementById("gameMode").value);
};
