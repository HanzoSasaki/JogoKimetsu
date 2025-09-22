    // Game variables
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        
        // Screen elements
        const menuScreen = document.getElementById('menu-screen');
        const levelSelectScreen = document.getElementById('level-select-screen');
        const gameOverScreen = document.getElementById('game-over-screen');
        const winScreen = document.getElementById('win-screen');
        
        // Buttons
        const startBtn = document.getElementById('start-btn');
        const levelSelectBtn = document.getElementById('level-select-btn');
        const level1Btn = document.getElementById('level1-btn');
        const level2Btn = document.getElementById('level2-btn');
        const level3Btn = document.getElementById('level3-btn');
        const backToMenuBtn = document.getElementById('back-to-menu-btn');
        const restartBtn = document.getElementById('restart-btn');
        const menuAfterGameOverBtn = document.getElementById('menu-after-game-over-btn');
        const playAgainBtn = document.getElementById('play-again-btn');
        const menuAfterWinBtn = document.getElementById('menu-after-win-btn');
        
        // HUD elements
        const livesCount = document.getElementById('lives-count');
        const coinsCount = document.getElementById('coins-count');
        const levelDisplay = document.getElementById('level-display');
        
        // Character selection
        const characterOptions = document.querySelectorAll('.character-option');
        let selectedCharacter = '😠';
        
        // Game state
        let gameState = {
            currentLevel: 1,
            lives: 3,
            playerCoins: 0,
            gameRunning: false,
            player: null,
            platforms: [],
            enemies: [],
            coins: [],
            flag: null,
            gravity: 0.5,
            keys: {},
            backgrounds: []
        };
        
        // Load background images
        function loadBackgrounds() {
            gameState.backgrounds = [
                { // Forest background
                    color: '#1b4332',
                    elements: [
                        { type: 'mountain', x: 100, y: 300, width: 200, height: 150, color: '#2d6a4f' },
                        { type: 'mountain', x: 400, y: 320, width: 180, height: 130, color: '#2d6a4f' },
                        { type: 'mountain', x: 650, y: 310, width: 160, height: 140, color: '#2d6a4f' },
                        { type: 'tree', x: 200, y: 350, size: 40, color: '#40916c' },
                        { type: 'tree', x: 500, y: 370, size: 35, color: '#40916c' },
                        { type: 'tree', x: 700, y: 360, size: 45, color: '#40916c' }
                    ]
                },
                { // Snow mountain background
                    color: '#3a5a80',
                    elements: [
                        { type: 'mountain', x: 50, y: 280, width: 250, height: 180, color: '#588157' },
                        { type: 'mountain', x: 350, y: 260, width: 220, height: 190, color: '#588157' },
                        { type: 'mountain', x: 600, y: 300, width: 200, height: 150, color: '#588157' },
                        { type: 'snow', x: 50, y: 280, width: 250, height: 20, color: '#f8f9fa' },
                        { type: 'snow', x: 350, y: 260, width: 220, height: 20, color: '#f8f9fa' },
                        { type: 'snow', x: 600, y: 300, width: 200, height: 20, color: '#f8f9fa' }
                    ]
                },
                { // Castle background
                    color: '#3d348b',
                    elements: [
                        { type: 'castle', x: 100, y: 200, width: 150, height: 200, color: '#6c757d' },
                        { type: 'castle', x: 550, y: 180, width: 180, height: 220, color: '#6c757d' },
                        { type: 'tower', x: 90, y: 150, width: 30, height: 50, color: '#495057' },
                        { type: 'tower', x: 230, y: 150, width: 30, height: 50, color: '#495057' },
                        { type: 'tower', x: 540, y: 130, width: 30, height: 50, color: '#495057' },
                        { type: 'tower', x: 700, y: 130, width: 30, height: 50, color: '#495057' },
                        { type: 'moon', x: 650, y: 50, size: 60, color: '#f8f9fa' }
                    ]
                }
            ];
        }
        
        // Draw background
        function drawBackground(levelIndex) {
            const bg = gameState.backgrounds[levelIndex - 1];
            if (!bg) return;
            
            // Draw sky
            ctx.fillStyle = bg.color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw background elements
            bg.elements.forEach(element => {
                ctx.fillStyle = element.color;
                
                switch(element.type) {
                    case 'mountain':
                        ctx.beginPath();
                        ctx.moveTo(element.x, element.y + element.height);
                        ctx.lineTo(element.x + element.width/2, element.y);
                        ctx.lineTo(element.x + element.width, element.y + element.height);
                        ctx.closePath();
                        ctx.fill();
                        break;
                        
                    case 'tree':
                        // Tree trunk
                        ctx.fillStyle = '#5a189a';
                        ctx.fillRect(element.x, element.y, 10, element.size);
                        // Tree top
                        ctx.fillStyle = element.color;
                        ctx.beginPath();
                        ctx.arc(element.x + 5, element.y - 10, element.size/2, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                        
                    case 'snow':
                        ctx.fillRect(element.x, element.y, element.width, element.height);
                        break;
                        
                    case 'castle':
                        ctx.fillRect(element.x, element.y, element.width, element.height);
                        // Windows
                        ctx.fillStyle = '#ffd60a';
                        for (let i = 0; i < 3; i++) {
                            for (let j = 0; j < 2; j++) {
                                ctx.fillRect(element.x + 20 + i*40, element.y + 30 + j*50, 15, 25);
                            }
                        }
                        break;
                        
                    case 'tower':
                        ctx.fillRect(element.x, element.y, element.width, element.height);
                        break;
                        
                    case 'moon':
                        ctx.beginPath();
                        ctx.arc(element.x, element.y, element.size/2, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                }
            });
        }
        
        // Player class
        class Player {
            constructor(x, y, width, height) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
                this.velocityX = 0;
                this.velocityY = 0;
                this.speed = 5;
                this.jumpForce = 12;
                this.isJumping = false;
                this.character = selectedCharacter;
                this.attackCooldown = 0;
                this.facing = 1; // 1 for right, -1 for left
            }
            
            update() {
                // Apply gravity
                this.velocityY += gameState.gravity;
                
                // Apply velocity
                this.x += this.velocityX;
                this.y += this.velocityY;
                
                // Update attack cooldown
                if (this.attackCooldown > 0) {
                    this.attackCooldown--;
                }
                
                // Boundary checks
                if (this.x < 0) this.x = 0;
                if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
                
                // Check if player fell off the screen
                if (this.y > canvas.height) {
                    loseLife();
                    resetPlayer();
                }
                
                // Platform collision
                this.isJumping = true;
                for (let platform of gameState.platforms) {
                    if (this.velocityY > 0 && 
                        this.x + this.width > platform.x && 
                        this.x < platform.x + platform.width &&
                        this.y + this.height > platform.y && 
                        this.y + this.height < platform.y + platform.height) {
                        
                        this.y = platform.y - this.height;
                        this.velocityY = 0;
                        this.isJumping = false;
                    }
                }
                
                // Enemy collision
                for (let enemy of gameState.enemies) {
                    if (enemy.active && this.x + this.width > enemy.x && 
                        this.x < enemy.x + enemy.width &&
                        this.y + this.height > enemy.y && 
                        this.y < enemy.y + enemy.height) {
                        
                        // If player is attacking
                        if (this.attackCooldown > 0) {
                            enemy.active = false;
                            this.velocityY = -this.jumpForce / 1.5;
                        } 
                        // If player is falling on enemy
                        else if (this.velocityY > 0 && this.y + this.height < enemy.y + enemy.height / 2) {
                            enemy.active = false;
                            this.velocityY = -this.jumpForce / 1.5;
                        } else {
                            loseLife();
                            resetPlayer();
                        }
                    }
                }
                
                // Coin collision
                for (let i = 0; i < gameState.coins.length; i++) {
                    let coin = gameState.coins[i];
                    if (this.x + this.width > coin.x && 
                        this.x < coin.x + coin.width &&
                        this.y + this.height > coin.y && 
                        this.y < coin.y + coin.height) {
                        
                        gameState.coins.splice(i, 1);
                        gameState.playerCoins++;
                        coinsCount.textContent = gameState.playerCoins;
                    }
                }
                
                // Flag collision (level complete)
                if (this.x + this.width > gameState.flag.x && 
                    this.x < gameState.flag.x + gameState.flag.width &&
                    this.y + this.height > gameState.flag.y && 
                    this.y < gameState.flag.y + gameState.flag.height) {
                    
                    if (gameState.currentLevel < 3) {
                        gameState.currentLevel++;
                        loadLevel(gameState.currentLevel);
                    } else {
                        // Game completed
                        winScreen.style.display = 'flex';
                        gameState.gameRunning = false;
                    }
                }
            }
            
            draw() {
                // Draw player as emoji
                ctx.font = `${this.height}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.character, this.x + this.width/2, this.y + this.height/2);
                
                // Draw attack effect if attacking
                if (this.attackCooldown > 0) {
                    ctx.fillStyle = 'rgba(255, 107, 107, 0.5)';
                    ctx.beginPath();
                    ctx.arc(
                        this.x + this.width/2 + (this.facing * 30), 
                        this.y + this.height/2, 
                        20, 0, Math.PI * 2
                    );
                    ctx.fill();
                }
            }
            
            jump() {
                if (!this.isJumping) {
                    this.velocityY = -this.jumpForce;
                    this.isJumping = true;
                }
            }
            
            attack() {
                if (this.attackCooldown === 0) {
                    this.attackCooldown = 20;
                }
            }
            
            moveLeft() {
                this.velocityX = -this.speed;
                this.facing = -1;
            }
            
            moveRight() {
                this.velocityX = this.speed;
                this.facing = 1;
            }
            
            stop() {
                this.velocityX = 0;
            }
        }
        
        // Platform class
        class Platform {
            constructor(x, y, width, height, color = '#6a994e') {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
                this.color = color;
            }
            
            draw() {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                // Add platform texture
                ctx.fillStyle = '#a7c957';
                for (let i = 0; i < this.width; i += 20) {
                    ctx.fillRect(this.x + i, this.y, 10, 3);
                }
            }
        }
        
        // Enemy class
        class Enemy {
            constructor(x, y, width, height, speed) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
                this.speed = speed;
                this.direction = 1; // 1 for right, -1 for left
                this.active = true;
            }
            
            update() {
                if (!this.active) return;
                
                this.x += this.speed * this.direction;
                
                // Change direction if hitting platform edges
                let onPlatform = false;
                for (let platform of gameState.platforms) {
                    if (this.x <= platform.x || this.x + this.width >= platform.x + platform.width) {
                        if (this.y + this.height >= platform.y && this.y + this.height <= platform.y + platform.height) {
                            onPlatform = true;
                            if (this.x <= platform.x || this.x + this.width >= platform.x + platform.width) {
                                this.direction *= -1;
                            }
                        }
                    }
                }
                
                // If not on platform, turn around
                if (!onPlatform) {
                    this.direction *= -1;
                }
            }
            
            draw() {
                if (!this.active) return;
                
                // Draw enemy as devil emoji
                ctx.font = `${this.height}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('😈', this.x + this.width/2, this.y + this.height/2);
            }
        }
        
        // Coin class
        class Coin {
            constructor(x, y, width = 20, height = 20) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
                this.animation = 0;
            }
            
            update() {
                this.animation += 0.1;
            }
            
            draw() {
                // Draw coin as gem emoji
                ctx.font = `${this.height}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('💎', this.x + this.width/2, this.y + this.height/2);
                
                // Add shine effect with rotation
                ctx.save();
                ctx.translate(this.x + this.width/2, this.y + this.height/2);
                ctx.rotate(this.animation);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillRect(-3, -this.height/3, 6, this.height/3);
                ctx.restore();
            }
        }
        
        // Flag class (end of level)
        class Flag {
            constructor(x, y, width = 40, height = 60) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
            }
            
            draw() {
                // Draw flag as Japanese shrine/torii gate emoji
                ctx.font = `${this.height}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⛩️', this.x + this.width/2, this.y + this.height/2);
            }
        }
        
        // Level definitions
        const levels = {
            1: {
                name: "Floresta Assombrada",
                playerStart: { x: 50, y: 400 },
                platforms: [
                    new Platform(0, 500, 200, 20, '#6a994e'),
                    new Platform(250, 450, 200, 20, '#6a994e'),
                    new Platform(500, 400, 150, 20, '#6a994e'),
                    new Platform(700, 350, 100, 20, '#6a994e'),
                    new Platform(600, 250, 100, 20, '#6a994e'),
                    new Platform(400, 300, 100, 20, '#6a994e'),
                    new Platform(200, 350, 100, 20, '#6a994e'),
                    new Platform(50, 250, 100, 20, '#6a994e')
                ],
                enemies: [
                    new Enemy(300, 430, 30, 30, 2),
                    new Enemy(550, 380, 30, 30, 2),
                    new Enemy(200, 330, 30, 30, 2)
                ],
                coins: [
                    new Coin(100, 460),
                    new Coin(300, 410),
                    new Coin(550, 360),
                    new Coin(650, 310),
                    new Coin(450, 260),
                    new Coin(250, 310),
                    new Coin(80, 210)
                ],
                flag: new Flag(750, 250)
            },
            2: {
                name: "Montanha Nevada",
                playerStart: { x: 50, y: 400 },
                platforms: [
                    new Platform(0, 500, 150, 20, '#6a994e'),
                    new Platform(200, 450, 150, 20, '#6a994e'),
                    new Platform(400, 400, 150, 20, '#6a994e'),
                    new Platform(600, 350, 150, 20, '#6a994e'),
                    new Platform(500, 250, 150, 20, '#6a994e'),
                    new Platform(300, 300, 150, 20, '#6a994e'),
                    new Platform(100, 350, 150, 20, '#6a994e'),
                    new Platform(200, 200, 150, 20, '#6a994e'),
                    new Platform(400, 150, 150, 20, '#6a994e')
                ],
                enemies: [
                    new Enemy(250, 430, 30, 30, 2.5),
                    new Enemy(450, 380, 30, 30, 2.5),
                    new Enemy(350, 280, 30, 30, 2.5),
                    new Enemy(550, 230, 30, 30, 2.5)
                ],
                coins: [
                    new Coin(70, 460),
                    new Coin(270, 410),
                    new Coin(470, 360),
                    new Coin(570, 310),
                    new Coin(370, 260),
                    new Coin(170, 310),
                    new Coin(250, 170),
                    new Coin(450, 120)
                ],
                flag: new Flag(450, 100)
            },
            3: {
                name: "Castelo de Muzan",
                playerStart: { x: 50, y: 400 },
                platforms: [
                    new Platform(0, 500, 100, 20, '#6a994e'),
                    new Platform(150, 450, 100, 20, '#6a994e'),
                    new Platform(300, 400, 100, 20, '#6a994e'),
                    new Platform(450, 350, 100, 20, '#6a994e'),
                    new Platform(600, 300, 100, 20, '#6a994e'),
                    new Platform(600, 200, 100, 20, '#6a994e'),
                    new Platform(450, 250, 100, 20, '#6a994e'),
                    new Platform(300, 300, 100, 20, '#6a994e'),
                    new Platform(150, 350, 100, 20, '#6a994e'),
                    new Platform(0, 250, 100, 20, '#6a994e'),
                    new Platform(150, 150, 100, 20, '#6a994e'),
                    new Platform(300, 100, 100, 20, '#6a994e')
                ],
                enemies: [
                    new Enemy(180, 430, 30, 30, 3),
                    new Enemy(330, 380, 30, 30, 3),
                    new Enemy(480, 330, 30, 30, 3),
                    new Enemy(630, 280, 30, 30, 3),
                    new Enemy(480, 230, 30, 30, 3),
                    new Enemy(330, 280, 30, 30, 3),
                    new Enemy(180, 330, 30, 30, 3)
                ],
                coins: [
                    new Coin(40, 460),
                    new Coin(190, 410),
                    new Coin(340, 360),
                    new Coin(490, 310),
                    new Coin(640, 260),
                    new Coin(490, 210),
                    new Coin(340, 260),
                    new Coin(190, 310),
                    new Coin(40, 220),
                    new Coin(190, 120),
                    new Coin(340, 70)
                ],
                flag: new Flag(350, 50)
            }
        };
        
        // Load a specific level
        function loadLevel(levelNum) {
            const level = levels[levelNum];
            if (!level) return;
            
            gameState.platforms = level.platforms;
            gameState.enemies = level.enemies;
            gameState.coins = level.coins;
            gameState.flag = level.flag;
            
            // Reset player position
            resetPlayer();
            
            // Update HUD
            levelDisplay.textContent = levelNum;
            gameState.currentLevel = levelNum;
            gameState.gameRunning = true;
            
            // Hide all screens
            menuScreen.style.display = 'none';
            levelSelectScreen.style.display = 'none';
            gameOverScreen.style.display = 'none';
            winScreen.style.display = 'none';
        }
        
        // Reset player to level start
        function resetPlayer() {
            const level = levels[gameState.currentLevel];
            gameState.player = new Player(
                level.playerStart.x, 
                level.playerStart.y, 
                40, 40
            );
            gameState.player.character = selectedCharacter;
        }
        
        // Lose a life
        function loseLife() {
            gameState.lives--;
            livesCount.textContent = gameState.lives;
            
            if (gameState.lives <= 0) {
                gameOverScreen.style.display = 'flex';
                gameState.gameRunning = false;
            }
        }
        
        // Reset game state
        function resetGame() {
            gameState.lives = 3;
            gameState.playerCoins = 0;
            gameState.currentLevel = 1;
            livesCount.textContent = gameState.lives;
            coinsCount.textContent = gameState.playerCoins;
            levelDisplay.textContent = gameState.currentLevel;
        }
        
        // Game loop
        function gameLoop() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background
            drawBackground(gameState.currentLevel);
            
            // Update and draw platforms
            for (let platform of gameState.platforms) {
                platform.draw();
            }
            
            // Update and draw coins
            for (let coin of gameState.coins) {
                coin.update();
                coin.draw();
            }
            
            // Update and draw enemies
            for (let enemy of gameState.enemies) {
                enemy.update();
                enemy.draw();
            }
            
            // Draw flag
            if (gameState.flag) {
                gameState.flag.draw();
            }
            
            // Update and draw player
            if (gameState.player) {
                gameState.player.update();
                gameState.player.draw();
            }
            
            // Handle player movement based on keys pressed
            if (gameState.keys['ArrowLeft'] || gameState.keys['KeyA']) {
                gameState.player.moveLeft();
            } else if (gameState.keys['ArrowRight'] || gameState.keys['KeyD']) {
                gameState.player.moveRight();
            } else {
                gameState.player.stop();
            }
            
            // Handle attack
            if ((gameState.keys['KeyZ'] || gameState.keys['KeyX']) && gameState.player) {
                gameState.player.attack();
            }
            
            // Continue game loop if game is running
            if (gameState.gameRunning) {
                requestAnimationFrame(gameLoop);
            }
        }
        
        // Event listeners for buttons
        startBtn.addEventListener('click', () => {
            resetGame();
            loadLevel(1);
            gameLoop();
        });
        
        levelSelectBtn.addEventListener('click', () => {
            menuScreen.style.display = 'none';
            levelSelectScreen.style.display = 'flex';
        });
        
        level1Btn.addEventListener('click', () => {
            resetGame();
            loadLevel(1);
            gameLoop();
        });
        
        level2Btn.addEventListener('click', () => {
            resetGame();
            loadLevel(2);
            gameLoop();
        });
        
        level3Btn.addEventListener('click', () => {
            resetGame();
            loadLevel(3);
            gameLoop();
        });
        
        backToMenuBtn.addEventListener('click', () => {
            levelSelectScreen.style.display = 'none';
            menuScreen.style.display = 'flex';
        });
        
        restartBtn.addEventListener('click', () => {
            resetGame();
            loadLevel(gameState.currentLevel);
            gameLoop();
        });
        
        menuAfterGameOverBtn.addEventListener('click', () => {
            gameOverScreen.style.display = 'none';
            menuScreen.style.display = 'flex';
        });
        
        playAgainBtn.addEventListener('click', () => {
            resetGame();
            loadLevel(1);
            gameLoop();
        });
        
        menuAfterWinBtn.addEventListener('click', () => {
            winScreen.style.display = 'none';
            menuScreen.style.display = 'flex';
        });
        
        // Character selection
        characterOptions.forEach(option => {
            option.addEventListener('click', () => {
                characterOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedCharacter = option.getAttribute('data-character');
            });
        });
        
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            gameState.keys[e.code] = true;
            
            if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && gameState.player) {
                gameState.player.jump();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            gameState.keys[e.code] = false;
        });
        
        // Initialize game
        loadBackgrounds();
        resetGame();