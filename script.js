// 1. Get references to HTML elements (updated)
const statusDisplay = document.getElementById('status-display');
const gameBoard = document.getElementById('game-board');
const resetButton = document.getElementById('reset-button');
const resetScoresButton = document.getElementById('reset-scores-button');
const cells = document.querySelectorAll('.cell');

const playerXScoreDisplay = document.getElementById('player-x-score');
const playerOScoreDisplay = document.getElementById('player-o-score');
const drawsScoreDisplay = document.getElementById('draws-score');

const pvpModeButton = document.getElementById('pvp-mode-button');
const pvcModeButton = document.getElementById('pvc-mode-button');

// NEW AI Difficulty buttons
const aiDifficultySelection = document.getElementById('ai-difficulty-selection');
const easyAiButton = document.getElementById('easy-ai-button');
const mediumAiButton = document.getElementById('medium-ai-button');
const hardAiButton = document.getElementById('hard-ai-button');

// NEW Game Over Modal elements
const gameOverModal = document.getElementById('game-over-modal');
const modalMessage = document.getElementById('modal-message');
const playAgainButton = document.getElementById('play-again-button');


// 2. Game state variables
let gameActive = true;
let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];

// Score variables
let scoreX = 0;
let scoreO = 0;
let scoreDraws = 0;

// Game mode variable
let isVsAI = false; // true for Player vs AI, false for Player vs Player

// AI player is always 'O'
const AI_PLAYER = 'O';
const HUMAN_PLAYER = 'X';

// NEW: AI Difficulty variable
let aiDifficulty = 'hard'; // Default to hard (unbeatable)

// 3. Winning conditions
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// 4. Functions to update game messages and scores
const displayPlayerTurn = () => {
    statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
    // Add visual indicator for current player (simple example: highlight status text)
    if (currentPlayer === HUMAN_PLAYER) {
        statusDisplay.style.color = '#e74c3c'; // Red for X
    } else {
        statusDisplay.style.color = '#3498db'; // Blue for O
    }
};

const displayWinner = (winner) => {
    statusDisplay.textContent = `Player ${winner} Wins!`;
    statusDisplay.style.color = '#27ae60'; // Green for win
    showGameOverModal(`Player ${winner} Wins!`); // Show modal
};

const displayDraw = () => {
    statusDisplay.textContent = 'It\'s a Draw!';
    statusDisplay.style.color = '#f1c40f'; // Yellow for draw
    showGameOverModal('It\'s a Draw!'); // Show modal
};

const updateScoreDisplay = () => {
    playerXScoreDisplay.textContent = `X: ${scoreX}`;
    playerOScoreDisplay.textContent = `O: ${scoreO}`;
    drawsScoreDisplay.textContent = `Draws: ${scoreDraws}`;
};

// Initial status display and score display
displayPlayerTurn();
updateScoreDisplay();

// --- AI Logic (Minimax with Difficulty Levels) ---

// Function to check if a player has won on a given board state
function checkWin(currentBoard, player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (currentBoard[a] === player && currentBoard[b] === player && currentBoard[c] === player) {
            return true;
        }
    }
    return false;
}

// Function to check if the board is full (draw)
function checkDraw(currentBoard) {
    return !currentBoard.includes('');
}

// The Minimax algorithm
function minimax(currentBoard, player) {
    // Base cases (terminal states)
    if (checkWin(currentBoard, AI_PLAYER)) {
        return 10; // AI wins
    }
    if (checkWin(currentBoard, HUMAN_PLAYER)) {
        return -10; // Human wins
    }
    if (checkDraw(currentBoard)) {
        return 0; // It's a draw
    }

    let bestScore;

    if (player === AI_PLAYER) { // Maximizing player (AI)
        bestScore = -Infinity;
        for (let i = 0; i < currentBoard.length; i++) {
            if (currentBoard[i] === '') {
                currentBoard[i] = player; // Make the move
                let score = minimax(currentBoard, HUMAN_PLAYER); // Recurse for opponent
                currentBoard[i] = ''; // Undo the move
                bestScore = Math.max(bestScore, score);
            }
        }
    } else { // Minimizing player (Human)
        bestScore = Infinity;
        for (let i = 0; i < currentBoard.length; i++) {
            if (currentBoard[i] === '') {
                currentBoard[i] = player; // Make the move
                let score = minimax(currentBoard, AI_PLAYER); // Recurse for AI
                currentBoard[i] = ''; // Undo the move
                bestScore = Math.min(bestScore, score);
            }
        }
    }
    return bestScore;
}

// Function for AI to find its best move using Minimax
function findBestMove() {
    let bestScore = -Infinity;
    let move = -1;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = AI_PLAYER; // Make a test move
            let score = minimax(board, HUMAN_PLAYER); // Evaluate the board state
            board[i] = ''; // Undo the test move

            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move; // Return the index of the best move
}

// NEW: Get all empty cells
function getEmptyCells(currentBoard) {
    const emptyCells = [];
    for (let i = 0; i < currentBoard.length; i++) {
        if (currentBoard[i] === '') {
            emptyCells.push(i);
        }
    }
    return emptyCells;
}

// NEW: AI Difficulty Logic
function getAIMove() {
    const emptyCells = getEmptyCells(board);

    if (aiDifficulty === 'easy') {
        // Easy: Random move
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        return emptyCells[randomIndex];
    } else if (aiDifficulty === 'medium') {
        // Medium: 50% chance of optimal move, 50% random
        if (Math.random() < 0.5) { // 50% chance for optimal
            return findBestMove();
        } else { // 50% chance for random
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            return emptyCells[randomIndex];
        }
    } else if (aiDifficulty === 'hard') {
        // Hard: Always optimal move
        return findBestMove();
    }
    return -1; // Should not happen
}


// Function to handle AI's turn (updated to use getAIMove)
function handleAITurn() {
    if (!gameActive) {
        return;
    }

    // Delay AI's move for better user experience
    setTimeout(() => {
        const aiMoveIndex = getAIMove();
        if (aiMoveIndex !== -1) {
            // Apply the AI's best move to the actual game board
            board[aiMoveIndex] = AI_PLAYER;
            cells[aiMoveIndex].textContent = AI_PLAYER;
            cells[aiMoveIndex].classList.add(AI_PLAYER.toLowerCase());
            checkGameResult();
        }
    }, 500); // 500ms delay
}

// --- END AI Logic ---


// 5. Handle a cell click
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.cellIndex);

    // Prevent human clicks if it's AI's turn in PvC mode
    if (isVsAI && currentPlayer === AI_PLAYER) {
        return;
    }

    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    board[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());

    checkGameResult();
}

// 6. Check for win or draw
function checkGameResult() {
    let roundWon = false;

    // Check for current player win
    if (checkWin(board, currentPlayer)) {
        roundWon = true;
        // Find the winning condition to highlight cells
        let winningLine;
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (board[a] === currentPlayer && board[b] === currentPlayer && board[c] === currentPlayer) {
                winningLine = winningConditions[i];
                break;
            }
        }
        if (winningLine) {
            cells[winningLine[0]].classList.add('win');
            cells[winningLine[1]].classList.add('win');
            cells[winningLine[2]].classList.add('win');
        }
    }

    if (roundWon) {
        gameActive = false;
        if (currentPlayer === HUMAN_PLAYER) {
            scoreX++;
        } else {
            scoreO++;
        }
        updateScoreDisplay();
        displayWinner(currentPlayer); // Calls modal
        return;
    }

    // Check for a draw
    let roundDraw = checkDraw(board);
    if (roundDraw) {
        gameActive = false;
        scoreDraws++;
        updateScoreDisplay();
        displayDraw(); // Calls modal
        return;
    }

    // If no win or draw, switch to the next player
    switchPlayer();
}

// 7. Switch turns
function switchPlayer() {
    currentPlayer = currentPlayer === HUMAN_PLAYER ? AI_PLAYER : HUMAN_PLAYER;
    displayPlayerTurn();

    // If it's AI's turn and in PvC mode, make the AI move
    if (isVsAI && currentPlayer === AI_PLAYER && gameActive) {
        handleAITurn();
    }
}

// 8. Reset the game (board only)
function resetGame() {
    gameActive = true;
    currentPlayer = HUMAN_PLAYER; // Human always starts as 'X'
    board = ['', '', '', '', '', '', '', '', ''];
    statusDisplay.textContent = `Player ${HUMAN_PLAYER}'s Turn`;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'win');
    });

    hideGameOverModal(); // Hide modal on reset

    // If starting a new game in AI mode and AI should make the first move (e.g. if AI was X)
    // In our current setup, HUMAN_PLAYER (X) always starts.
    // If you wanted AI to potentially go first (as X), you'd add handleAITurn() here
    // if (isVsAI && AI_PLAYER === 'X') { setTimeout(handleAITurn, 500); }
}

// Reset scores function
function resetScores() {
    scoreX = 0;
    scoreO = 0;
    scoreDraws = 0;
    updateScoreDisplay();
}

// Function to change game mode (updated for AI difficulty visibility)
function changeGameMode(mode) {
    if (mode === 'pvp') {
        isVsAI = false;
        pvpModeButton.classList.add('active-mode');
        pvcModeButton.classList.remove('active-mode');
        aiDifficultySelection.classList.add('hidden'); // Hide difficulty options
    } else if (mode === 'pvc') {
        isVsAI = true;
        pvcModeButton.classList.add('active-mode');
        pvpModeButton.classList.remove('active-mode');
        aiDifficultySelection.classList.remove('hidden'); // Show difficulty options
    }
    resetScores();
    resetGame();
}

// NEW: Function to change AI difficulty
function changeAIDifficulty(difficulty) {
    aiDifficulty = difficulty;
    // Remove active-difficulty from all buttons
    easyAiButton.classList.remove('active-difficulty');
    mediumAiButton.classList.remove('active-difficulty');
    hardAiButton.classList.remove('active-difficulty');

    // Add active-difficulty to the clicked button
    if (difficulty === 'easy') {
        easyAiButton.classList.add('active-difficulty');
    } else if (difficulty === 'medium') {
        mediumAiButton.classList.add('active-difficulty');
    } else if (difficulty === 'hard') {
        hardAiButton.classList.add('active-difficulty');
    }
    resetGame(); // Reset game to apply new AI difficulty
}

// NEW: Game Over Modal functions
function showGameOverModal(message) {
    modalMessage.textContent = message;
    gameOverModal.classList.remove('hidden');
}

function hideGameOverModal() {
    gameOverModal.classList.add('hidden');
}


// 9. Event Listeners (updated for new buttons and initial mode)
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

resetButton.addEventListener('click', resetGame);
resetScoresButton.addEventListener('click', resetScores);
playAgainButton.addEventListener('click', resetGame); // Event listener for modal button

// Event listeners for mode buttons
pvpModeButton.addEventListener('click', () => changeGameMode('pvp'));
pvcModeButton.addEventListener('click', () => changeGameMode('pvc'));

// NEW: Event listeners for AI difficulty buttons
easyAiButton.addEventListener('click', () => changeAIDifficulty('easy'));
mediumAiButton.addEventListener('click', () => changeAIDifficulty('medium'));
hardAiButton.addEventListener('click', () => changeAIDifficulty('hard'));

// Initial mode setup
changeGameMode('pvp'); // Start in Player vs Player mode by default
changeAIDifficulty('hard'); // Default AI difficulty (will be hidden if in PvP mode)
