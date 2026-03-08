// ================= VARIABLES =================
let cells = document.querySelectorAll(".cell");
let board = document.querySelector(".board");
let statusText = document.getElementById("status");

let currentPlayer = "X";
let gameActive = false;

let gameMode = "player";
let difficulty = "easy";

let round = 1;
let maxRounds = 3;

let scoreX = 0;
let scoreO = 0;

let soundOn = true;

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// ================= START GAME =================
function startGame(){
document.querySelector(".board").classList.add("active");
    // Get dropdown values
    gameMode = document.getElementById("gameMode").value;
    difficulty = document.getElementById("difficulty").value;

    document.getElementById("welcomePage").style.display = "none";
    document.getElementById("gamePage").style.display = "block";

    round = 1;
    scoreX = 0;
    scoreO = 0;

    updateScore();
    restartBoard();

    document.getElementById("roundInfo").innerText = "Round 1 of 3";
}

// ================= CELL CLICK =================
cells.forEach(cell => {
    cell.addEventListener("click", function(){

        if(!gameActive || cell.innerText !== "") return;

        cell.innerText = currentPlayer;

        if(checkWinner()){
            handleWin(currentPlayer);
            return;
        }

        if(checkDraw()){
            handleDraw();
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusText.innerText = "Player " + currentPlayer + " Turn";

        if(gameMode === "computer" && currentPlayer === "O"){
            setTimeout(computerMove, 400);
        }
    });
});

// ================= HANDLE WIN =================
function handleWin(player){
    gameActive = false;

    if(player === "X") scoreX++;
    else scoreO++;

    updateScore();

    if(round >= maxRounds){
        showFinalWinner();
    } else {
        statusText.innerText = "Player " + player + " Wins!";
    }
}

// ================= HANDLE DRAW =================
function handleDraw(){
    gameActive = false;

    if(round >= maxRounds){
        showFinalWinner();
    } else {
        statusText.innerText = "Draw!";
    }
}

// ================= NEXT ROUND =================
function nextRound(){
    if(round >= maxRounds) return;

    round++;
    document.getElementById("roundInfo").innerText =
        "Round " + round + " of 3";

    restartBoard();
}

// ================= RESTART BOARD =================
function restartBoard(){
    cells.forEach(cell => cell.innerText = "");
    currentPlayer = "X";
    gameActive = true;
    statusText.innerText = "Player X Turn";
    document.querySelector(".board").classList.remove("active");
}

// ================= UPDATE SCORE =================
function updateScore(){
    document.getElementById("score1").innerText = scoreX;
    document.getElementById("score2").innerText = scoreO;
}

// ================= FINAL WINNER =================
function showFinalWinner(){

    let popup = document.getElementById("winnerPopup");
    let text = document.getElementById("popupText");

    if(scoreX > scoreO){
        text.innerText = "🎉 Congratulations Player X 🎉";
    }
    else if(scoreO > scoreX){
        text.innerText = "🎉 Congratulations Player O 🎉";
    }
    else{
        text.innerText = "🤝 It's a Tie!";
    }

    popup.style.display = "flex";
}

// ================= CHECK WIN =================
function checkWinner(){
    return winPatterns.some(pattern => {
        return pattern.every(index =>
            cells[index].innerText === currentPlayer
        );
    });
}

// ================= CHECK DRAW =================
function checkDraw(){
    return [...cells].every(cell => cell.innerText !== "");
}

// ================= COMPUTER MOVE =================
function computerMove(){

    if(!gameActive) return;

    let emptyCells = [...cells].filter(c => c.innerText === "");
    if(emptyCells.length === 0) return;

    let move;

    if(difficulty === "easy"){
        move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    else if(difficulty === "medium"){
        move = findBlockingMove() ||
               emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    else{
        move = minimaxMove();
    }

    move.innerText = "O";

    if(checkWinner()){
        handleWin("O");
        return;
    }

    if(checkDraw()){
        handleDraw();
        return;
    }

    currentPlayer = "X";
    statusText.innerText = "Player X Turn";
}

// ================= BLOCK PLAYER =================
function findBlockingMove(){
    for(let pattern of winPatterns){
        let values = pattern.map(i => cells[i].innerText);

        if(values.filter(v => v === "X").length === 2 &&
           values.includes("")){
            let index = pattern[values.indexOf("")];
            return cells[index];
        }
    }
    return null;
}

// ================= MINIMAX =================
function minimaxMove(){
    let bestScore = -Infinity;
    let bestMove;

    cells.forEach(cell => {
        if(cell.innerText === ""){
            cell.innerText = "O";
            let score = minimax(false);
            cell.innerText = "";
            if(score > bestScore){
                bestScore = score;
                bestMove = cell;
            }
        }
    });

    return bestMove;
}

function minimax(isMax){
    if(checkWinner()) return isMax ? -1 : 1;
    if(checkDraw()) return 0;

    if(isMax){
        let best = -Infinity;
        cells.forEach(cell=>{
            if(cell.innerText===""){
                cell.innerText="O";
                let score=minimax(false);
                cell.innerText="";
                best=Math.max(score,best);
            }
        });
        return best;
    }else{
        let best=Infinity;
        cells.forEach(cell=>{
            if(cell.innerText===""){
                cell.innerText="X";
                let score=minimax(true);
                cell.innerText="";
                best=Math.min(score,best);
            }
        });
        return best;
    }
}

// ================= THEME =================
function setTheme(theme){
    document.body.classList.remove("light","dark","neon");
    document.body.classList.add(theme);
}

// ================= SOUND =================
function toggleSound(){
    soundOn = !soundOn;
    document.getElementById("soundBtn").innerText =
        soundOn ? "🔊 Sound On" : "🔇 Sound Off";
}

// ================= BACK BUTTON =================
function goBack(){
    document.getElementById("gamePage").style.display = "none";
    document.getElementById("welcomePage").style.display = "flex";
}

function goBackFromPopup(){
    document.getElementById("winnerPopup").style.display = "none";
    goBack();
}