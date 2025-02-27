// Game state
const gameState = {
  currentLevel: 1,
  playerPosition: { row: 0, col: 0 },
  goalPosition: { row: 0, col: 0 },
  maze: [],
  mazeSize: 0,
  gameStarted: false
};

// Level configurations
const levels = [
  {
    size: 5,
    difficulty: 'easy',
    message: "Great job! You found the first heart! Let's make it a bit more challenging..."
  },
  {
    size: 12, // Increased from 8 to 12
    difficulty: 'medium',
    message: "Impressive! You're getting closer to my heart. One more level to go!"
  },
  {
    size: 20, // size of the level
    
    difficulty: 'hard',
    finalMessage: "Yaaay you won......my heart *smork*.\nhalpy late balmetiem day mako, wab u mako. thank you for making the past year bearable and amazing por me."
  }
];

// DOM elements
const mazeElement = document.getElementById('maze');
const currentLevelElement = document.getElementById('current-level');
const messageModal = document.getElementById('message-modal');
const modalMessage = document.getElementById('modal-message');
const nextLevelBtn = document.getElementById('next-level-btn');
const finalModal = document.getElementById('final-modal');
const finalMessage = document.getElementById('final-message');
const restartBtn = document.getElementById('restart-btn');

// Control buttons
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

// Initialize the game
function initGame() {
  gameState.currentLevel = 1;
  loadLevel(gameState.currentLevel);
  
  // Add event listeners
  document.addEventListener('keydown', handleKeyPress);
  upBtn.addEventListener('click', () => movePlayer('up'));
  downBtn.addEventListener('click', () => movePlayer('down'));
  leftBtn.addEventListener('click', () => movePlayer('left'));
  rightBtn.addEventListener('click', () => movePlayer('right'));
  nextLevelBtn.addEventListener('click', goToNextLevel);
  restartBtn.addEventListener('click', restartGame);
}

// Load a specific level
function loadLevel(levelIndex) {
  if (!gameState.gameStarted) return;
  
  const level = levels[levelIndex - 1];
  gameState.mazeSize = level.size;
  
  // Update UI
  currentLevelElement.textContent = levelIndex;
  mazeElement.style.setProperty('--maze-size', level.size);
  
  // Generate maze
  generateMaze(level.size, level.difficulty);
  renderMaze();
}

// Generate a random maze
function generateMaze(size, difficulty) {
  // Create empty maze
  gameState.maze = Array(size).fill().map(() => Array(size).fill(0));
  
  // Set player starting position (top-left)
  gameState.playerPosition = { row: 0, col: 0 };
  
  // Set goal position (bottom-right)
  gameState.goalPosition = { row: size - 1, col: size - 1 };
  
  // Add walls based on difficulty
  let wallPercentage;
  switch (difficulty) {
    case 'easy':
      wallPercentage = 0.15; // Reduced from 0.2 to make level 1 more accessible
      break;
    case 'medium':
      wallPercentage = 0.25; // Reduced from 0.3 to make level 2 more accessible
      break;
    case 'hard':
      wallPercentage = 0.35;
      break;
    default:
      wallPercentage = 0.25;
  }
  
  // Place random walls
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Skip player and goal positions
      if ((row === 0 && col === 0) || (row === size - 1 && col === size - 1)) {
        continue;
      }
      
      if (Math.random() < wallPercentage) {
        gameState.maze[row][col] = 1; // 1 represents a wall
      }
    }
  }
  
  // Ensure maze is solvable
  ensureMazeIsSolvable(size);
}

// Make sure there's a path from start to finish
function ensureMazeIsSolvable(size) {
  // For level 1, create a simple direct path
  if (gameState.currentLevel === 1) {
    createSimplePath(size);
    return;
  }
  
  // For level 2, create a more reliable path
  if (gameState.currentLevel === 2) {
    createReliablePath(size);
    return;
  }
  
  // Simple implementation: create a clear path along the edges
  // This guarantees at least one solution
  
  // Clear top row
  for (let col = 0; col < size; col++) {
    if (Math.random() > 0.7) { // Add some randomness to the path
      gameState.maze[0][col] = 0;
    }
  }
  
  // Clear right column
  for (let row = 0; row < size; row++) {
    if (Math.random() > 0.7) { // Add some randomness to the path
      gameState.maze[row][size - 1] = 0;
    }
  }
  
  // Always ensure start and end are clear
  gameState.maze[0][0] = 0;
  gameState.maze[size - 1][size - 1] = 0;
  
  // For harder levels, make the path less obvious
  if (gameState.currentLevel > 1 && gameState.currentLevel !== 2) {
    addMazeComplexity(size);
  }
}

// Create a simple path for level 1
function createSimplePath(size) {
  // For level 1, create a very clear and direct path
  // This ensures beginners can easily complete the first level
  
  // Method 1: Create a direct diagonal path
  for (let i = 0; i < size; i++) {
    if (i < size) {
      gameState.maze[i][i] = 0; // Clear diagonal cells
    }
  }
  
  // Method 2: Create a border path (L-shaped)
  for (let i = 0; i < size; i++) {
    gameState.maze[0][i] = 0; // Clear top row
    gameState.maze[i][size-1] = 0; // Clear rightmost column
  }
  
  // Method 3: Create a zigzag path
  let row = 0;
  let col = 0;
  
  while (row < size - 1 || col < size - 1) {
    gameState.maze[row][col] = 0; // Clear current cell
    
    // Alternate between moving right and down
    if (row === col) {
      if (col < size - 1) col++;
      else row++;
    } else {
      if (row < size - 1) row++;
      else col++;
    }
  }
  
  // Always ensure start and end are clear
  gameState.maze[0][0] = 0;
  gameState.maze[size - 1][size - 1] = 0;
  
  // Clear cells adjacent to start and goal to make it easier
  if (size > 1) {
    gameState.maze[0][1] = 0; // Right of start
    gameState.maze[1][0] = 0; // Below start
    gameState.maze[size-2][size-1] = 0; // Above goal
    gameState.maze[size-1][size-2] = 0; // Left of goal
  }
  
  // Clear more cells to make level 1 very easy
  for (let i = 0; i < size * 3; i++) {
    const randomRow = Math.floor(Math.random() * size);
    const randomCol = Math.floor(Math.random() * size);
    gameState.maze[randomRow][randomCol] = 0;
  }
}

// Create a reliable path for level 2
function createReliablePath(size) {
  // Clear a zigzag path from start to goal
  let row = 0;
  let col = 0;
  
  // First, ensure there's a clear path
  while (row < size - 1 || col < size - 1) {
    gameState.maze[row][col] = 0; // Clear current cell
    
    // Decide whether to move down or right
    if (row === size - 1) {
      // At bottom edge, move right
      col++;
    } else if (col === size - 1) {
      // At right edge, move down
      row++;
    } else {
      // Randomly choose direction with slight bias toward moving diagonally
      if (Math.random() < 0.55) {
        row++;
      } else {
        col++;
      }
    }
  }
  
  // Create some additional paths for the larger maze
  // This creates a more complex but still solvable maze
  
  // Create a second path from middle to goal
  let midRow = Math.floor(size / 2);
  let midCol = Math.floor(size / 2);
  
  // Clear the middle point
  gameState.maze[midRow][midCol] = 0;
  
  // Create path from middle to goal
  row = midRow;
  col = midCol;
  while (row < size - 1 || col < size - 1) {
    gameState.maze[row][col] = 0;
    
    if (row === size - 1) {
      col++;
    } else if (col === size - 1) {
      row++;
    } else {
      if (Math.random() < 0.6) {
        row++;
      } else {
        col++;
      }
    }
  }
  
  // Create path from start to middle
  row = 0;
  col = 0;
  while (row < midRow || col < midCol) {
    gameState.maze[row][col] = 0;
    
    if (row === midRow) {
      col++;
    } else if (col === midCol) {
      row++;
    } else {
      if (Math.random() < 0.5) {
        row++;
      } else {
        col++;
      }
    }
  }
  
  // Clear some additional cells to create alternative paths
  // This makes the maze more interesting but still solvable
  for (let i = 0; i < size * 2; i++) {
    const randomRow = Math.floor(Math.random() * size);
    const randomCol = Math.floor(Math.random() * size);
    gameState.maze[randomRow][randomCol] = 0;
  }
  
  // Always ensure start and end are clear
  gameState.maze[0][0] = 0;
  gameState.maze[size - 1][size - 1] = 0;
  
  // Clear cells adjacent to start and goal to make it easier
  if (size > 1) {
    gameState.maze[0][1] = 0; // Right of start
    gameState.maze[1][0] = 0; // Below start
    gameState.maze[size-2][size-1] = 0; // Above goal
    gameState.maze[size-1][size-2] = 0; // Left of goal
  }
}

// Add complexity to make the maze more challenging
function addMazeComplexity(size) {
  // Create a primary solution path using a more complex winding pattern
  let currentRow = 0;
  let currentCol = 0;
  
  // Fill most of the maze with walls first
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (Math.random() < 0.7) { // 70% chance of walls
        gameState.maze[i][j] = 1;
      }
    }
  }

  // Create primary solution path
  while (currentRow < size - 1 || currentCol < size - 1) {
    gameState.maze[currentRow][currentCol] = 0;
    
    // More complex path generation with backtracking possibility
    if (currentRow === size - 1) {
      currentCol++;
    } else if (currentCol === size - 1) {
      currentRow++;
    } else {
      const direction = Math.random();
      if (direction < 0.4) {
        currentRow++;
      } else if (direction < 0.7) {
        currentCol++;
      } else if (direction < 0.85 && currentRow > 0) {
        // Sometimes backtrack up
        currentRow--;
      } else if (currentCol > 0) {
        // Sometimes backtrack left
        currentCol--;
      } else {
        // If can't backtrack, move forward
        Math.random() < 0.5 ? currentRow++ : currentCol++;
      }
    }
  }

  // Create a second solution path
  let altRow = 0;
  let altCol = 0;
  const midPoint = Math.floor(size / 2);

  // Create path to middle
  while (altRow < midPoint || altCol < midPoint) {
    gameState.maze[altRow][altCol] = 0;
    if (Math.random() < 0.6) {
      altRow = Math.min(altRow + 1, midPoint);
    } else {
      altCol = Math.min(altCol + 1, midPoint);
    }
  }

  // Create path from middle to goal
  altRow = midPoint;
  altCol = midPoint;
  while (altRow < size - 1 || altCol < size - 1) {
    gameState.maze[altRow][altCol] = 0;
    if (Math.random() < 0.6) {
      altRow = Math.min(altRow + 1, size - 1);
    } else {
      altCol = Math.min(altCol + 1, size - 1);
    }
  }

  // Add some strategic dead ends
  for (let i = 0; i < size / 2; i++) {
    const startX = Math.floor(Math.random() * (size - 2)) + 1;
    const startY = Math.floor(Math.random() * (size - 2)) + 1;
    let length = Math.floor(Math.random() * 5) + 3;
    
    let x = startX;
    let y = startY;
    
    while (length > 0) {
      if (x >= 0 && x < size && y >= 0 && y < size) {
        gameState.maze[y][x] = 0;
        const dir = Math.floor(Math.random() * 4);
        switch (dir) {
          case 0: y = Math.max(0, y - 1); break;
          case 1: y = Math.min(size - 1, y + 1); break;
          case 2: x = Math.max(0, x - 1); break;
          case 3: x = Math.min(size - 1, x + 1); break;
        }
      }
      length--;
    }
  }

  // Always ensure start and goal are accessible
  gameState.maze[0][0] = 0;
  gameState.maze[size - 1][size - 1] = 0;
  gameState.maze[0][1] = 0;
  gameState.maze[1][0] = 0;
  gameState.maze[size-2][size-1] = 0;
  gameState.maze[size-1][size-2] = 0;
}

// Render the maze on the screen
function renderMaze() {
  mazeElement.innerHTML = '';
  
  for (let row = 0; row < gameState.mazeSize; row++) {
    for (let col = 0; col < gameState.mazeSize; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      
      // Add wall class if this cell is a wall
      if (gameState.maze[row][col] === 1) {
        cell.classList.add('wall');
      }
      
      // Add goal class if this is the goal position
      if (row === gameState.goalPosition.row && col === gameState.goalPosition.col) {
        cell.classList.add('goal');
      }
      
      // Add player if this is the player position
      if (row === gameState.playerPosition.row && col === gameState.playerPosition.col) {
        const player = document.createElement('div');
        player.classList.add('player');
        player.innerHTML = '❤️';
        cell.appendChild(player);
      }
      
      mazeElement.appendChild(cell);
    }
  }
}

// Handle keyboard input
function handleKeyPress(event) {
  switch (event.key) {
    case 'ArrowUp':
      movePlayer('up');
      break;
    case 'ArrowDown':
      movePlayer('down');
      break;
    case 'ArrowLeft':
      movePlayer('left');
      break;
    case 'ArrowRight':
      movePlayer('right');
      break;
  }
}

// Move the player in the specified direction
function movePlayer(direction) {
  const newPosition = { ...gameState.playerPosition };
  
  switch (direction) {
    case 'up':
      newPosition.row--;
      break;
    case 'down':
      newPosition.row++;
      break;
    case 'left':
      newPosition.col--;
      break;
    case 'right':
      newPosition.col++;
      break;
  }
  
  // Check if the move is valid
  if (isValidMove(newPosition)) {
    gameState.playerPosition = newPosition;
    renderMaze();
    
    // Check if player reached the goal
    checkGoal();
  }
}

// Check if a move is valid
function isValidMove(position) {
  // Check boundaries
  if (position.row < 0 || position.row >= gameState.mazeSize || 
      position.col < 0 || position.col >= gameState.mazeSize) {
    return false;
  }
  
  // Check if the cell is a wall
  if (gameState.maze[position.row][position.col] === 1) {
    return false;
  }
  
  return true;
}

// Check if player reached the goal
function checkGoal() {
  if (gameState.playerPosition.row === gameState.goalPosition.row && 
      gameState.playerPosition.col === gameState.goalPosition.col) {
    showLevelComplete();
  }
}

// Go to the next level
function goToNextLevel() {
  messageModal.style.display = 'none';
  gameState.currentLevel++;
  loadLevel(gameState.currentLevel);
}

// Restart the game
function restartGame() {
  finalModal.style.display = 'none';
  initGame();
}

// Start the game when the page loads
window.addEventListener('load', initGame);

function showLevelComplete() {
  if (gameState.currentLevel < 3) {
    // Show level completion message
    modalMessage.textContent = levels[gameState.currentLevel - 1].message;
    messageModal.style.display = 'flex';
  } else {
    // Show final message for completing all levels
    finalMessage.textContent = levels[2].finalMessage;
    finalModal.style.display = 'flex';
  }
}

function showMessage(message) {
  modalMessage.textContent = message;
  messageModal.style.display = 'flex';
}

function initializeLevel(level) {
  // ... rest of initialization code ...
}

// Add start screen function
function createStartScreen() {
  const startScreen = document.createElement('div');
  startScreen.className = 'start-screen';
  startScreen.innerHTML = `
    <div class="start-content">
      <h1>Valentine's Maze</h1>
      <button id="startGameBtn">Play ❤️</button>
    </div>
  `;
  document.body.appendChild(startScreen);

  document.getElementById('startGameBtn').addEventListener('click', () => {
    startScreen.style.opacity = '0';
    setTimeout(() => {
      startScreen.remove();
      gameState.gameStarted = true;
      initializeGame();
    }, 500);
  });
}

// Modify window.onload
window.onload = function() {
  // Show start screen before anything else
  showStartScreen();
  
  // Initialize game elements
  mazeElement = document.getElementById('maze');
  currentLevelElement = document.getElementById('current-level');
  messageModal = document.getElementById('message-modal');
  modalMessage = document.getElementById('modal-message');
  nextLevelBtn = document.getElementById('next-level-btn');
  restartBtn = document.getElementById('restart-btn');
  
  // Add event listeners
  document.addEventListener('keydown', handleKeyPress);
  nextLevelBtn.addEventListener('click', goToNextLevel);
  restartBtn.addEventListener('click', restartGame);
  
  // Add touch events for mobile
  document.addEventListener('touchstart', handleTouchStart);
  document.addEventListener('touchmove', handleTouchMove);
};

// Modify initializeGame
function initializeGame() {
  gameState.currentLevel = 1;
  loadLevel(gameState.currentLevel);
}

// Add this function
function showStartScreen() {
  // Create and add start screen
  const startScreen = document.createElement('div');
  startScreen.className = 'start-screen';
  startScreen.innerHTML = `
    <div class="start-content">
      <h1>Valentine's Maze</h1>
      <button id="startGameBtn">Play ❤️</button>
    </div>
  `;
  document.body.appendChild(startScreen);

  // Hide the maze initially
  const mazeElement = document.getElementById('maze');
  if (mazeElement) {
    mazeElement.style.display = 'none';
  }

  // Add click handler for start button
  document.getElementById('startGameBtn').addEventListener('click', () => {
    startScreen.style.opacity = '0';
    setTimeout(() => {
      startScreen.remove();
      if (mazeElement) {
        mazeElement.style.display = 'grid';
      }
      gameState.gameStarted = true;
      initializeGame(); // Start the game
    }, 500);
  });
}