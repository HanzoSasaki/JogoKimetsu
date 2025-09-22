 // Game variables
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        
        // Screen elements
        const loadingScreen = document.getElementById('loading-screen');
        const menuScreen = document.getElementById('menu-screen');
        const levelSelectScreen = document.getElementById('level-select-screen');
        const gameOverScreen = document.getElementById('game-over-screen');
        const winScreen = document.getElementById('win-screen');
        const trailerScreen = document.getElementById('trailer-screen');
        const levelComplete = document.getElementById('level-complete');
        
        // Buttons
        const startBtn = document.getElementById('start-btn');
        const levelSelectBtn = document.getElementById('level-select-btn');
        const level1Btn = document.getElementById('level1-btn');
        const level2Btn = document.getElementById('level2-btn');
        const level3Btn = document.getElementById('level3-btn');
        const backToMenuBtn = document.getElementById('back-to-menu-btn');
        const restartBtn = document.getElementById('restart-btn');
        const menuAfterGameOverBtn = document.getElementById('menu-after-game-over-btn');
        const watchTrailerBtn = document.getElementById('watch-trailer-btn');
        const playAgainBtn = document.getElementById('play-again-btn');
        const backAfterTrailerBtn = document.getElementById('back-after-trailer-btn');
        
        // HUD elements
        const livesCount = document.getElementById('lives-count');
        const coinsCount = document.getElementById('coins-count');
        const levelDisplay = document.getElementById('level-display');
        const healthFill = document.getElementById('health-fill');
        
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
            backgrounds: [],
            health: 100,
            particles: []
        };
        
        // Create particles for background
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            particlesContainer.innerHTML = '';
            
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                const size = Math.random() * 10 + 5;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.animationDelay = `${Math.random() * 15}s`;
                particle.style.animationDuration = `${15 + Math.random() * 10}s`;
                particlesContainer.appendChild(particle);
            }
        }
        
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
                        { type: 'tree', x: 700, y: 360, size: 45, color: '#40916c' },
                        { type: 'sakura', x: 150, y: 100, size: 30, color: '#ff9ebb' },
                        { type: 'sakura', x: 500, y: 80, size: 40, color: '#ff9ebb' },
                        { type: 'sakura', x: 750, y: 120, size: 35, color: '#ff9ebb' }
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
                        { type: 'snow', x: 600, y: 300, width: 200, height: 20, color: '#f8f9fa' },
                        { type: 'cloud', x: 100, y: 100, width: 120, height: 40, color: '#e9ecef' },
                        { type: 'cloud', x: 500, y: 70, width: 150, height: 50, color: '#e9ecef' },
                        { type: 'cloud', x: 700, y: 120, width: 100, height: 30, color: '#e9ecef' }
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
                        { type: 'moon', x: 650, y: 50, size: 60, color: '#f8f9fa' },
                        { type: 'star', x: 100, y: 60, size: 5, color: '#ffd60a' },
                        { type: 'star', x: 200, y: 90, size: 3, color: '#ffd60a' },
                        { type: 'star', x: 300, y: 40, size: 4, color: '#ffd60a' },
                        { type: 'star', x: 400, y: 70, size: 6, color: '#ffd60a' }
                    ]
                }
            ];
        }
        
        // Draw background
        function drawBackground(levelIndex) {
            const bg = gameState.backgrounds[levelIndex - 1];
            if (!bg) return;
            
            // Draw sky with gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, bg.color);
            gradient.addColorStop(1, '#0d1b2a');
            ctx.fillStyle = gradient;
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
                        // Add mountain details
                        ctx.strokeStyle = '#2d6a4f';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(element.x + element.width/3, element.y + element.height/2);
                        ctx.lineTo(element.x + element.width/2, element.y + element.height/3);
                        ctx.lineTo(element.x + 2*element.width/3, element.y + element.height/2);
                        ctx.stroke();
                        break;
                        
                    case 'tree':
                        // Tree trunk
                        ctx.fillStyle = '#5a189a';
                        ctx.fillRect(element.x, element.y, 15, element.size);
                        // Tree top
                        ctx.fillStyle = element.color;
                        ctx.beginPath();
                        ctx.arc(element.x + 7, element.y - 10, element.size/2, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                        
                    case 'snow':
                        ctx.fillRect(element.x, element.y, element.width, element.height);
                        break;
                        
                    case 'cloud':
                        ctx.beginPath();
                        ctx.ellipse(element.x, element.y, element.width/2, element.height/2, 0, 0, Math.PI * 2);
                        ctx.ellipse(element.x + element.width/3, element.y - element.height/3, element.width/3, element.height/2, 0, 0, Math.PI * 2);
                        ctx.ellipse(element.x + 2*element.width/3, element.y, element.width/3, element.height/2, 0, 0, Math.PI * 2);
                        ctx.fill();
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
                        // Castle roof
                        ctx.fillStyle = '#d00000';
                        ctx.beginPath();
                        ctx.moveTo(element.x - 10, element.y);
                        ctx.lineTo(element.x + element.width/2, element.y - 30);
                        ctx.lineTo(element.x + element.width + 10, element.y);
                        ctx.closePath();
                        ctx.fill();
                        break;
                        
                    case 'tower':
                        ctx.fillRect(element.x, element.y, element.width, element.height);
                        // Tower roof
                        ctx.fillStyle = '#d00000';
                        ctx.beginPath();
                        ctx.moveTo(element.x - 5, element.y);
                        ctx.lineTo(element.x + element.width/2, element.y - 20);
                        ctx.lineTo(element.x + element.width + 5, element.y);
                        ctx.closePath();
                        ctx.fill();
                        break;
                        
                    case 'moon':
                        ctx.beginPath();
                        ctx.arc(element.x, element.y, element.size/2, 0, Math.PI * 2);
                        ctx.fill();
                        // Moon craters
                        ctx.fillStyle = '#adb5bd';
                        ctx.beginPath();
                        ctx.arc(element.x - 10, element.y - 5, 5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(element.x + 15, element.y + 10, 8, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                        
                    case 'star':
                        ctx.fillStyle = element.color;
                        ctx.beginPath();
                        ctx.arc(element.x, element.y, element.size, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                        
                    case 'sakura':
                        ctx.fillStyle = element.color;
                        ctx.beginPath();
                        for (let i = 0; i < 5; i++) {
                            const angle = (i * 2 * Math.PI) / 5;
                            const x = element.x + Math.cos(angle) * element.size;
                            const y = element.y + Math.sin(angle) * element.size;
                            if (i === 0) {
                                ctx.moveTo(x, y);
                            } else {
                                ctx.lineTo(x, y);
                            }
                        }
                        ctx.closePath();
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
                this.speed = 6;
                this.jumpForce = 14;
                this.isJumping = false;
                this.character = selectedCharacter;
                this.attackCooldown = 0;
                this.facing = 1; // 1 for right, -1 for left
                this.invincible = 0;
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
                
                // Update invincibility
                if (this.invincible > 0) {
                    this.invincible--;
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
                            gameState.playerCoins += 5;
                            coinsCount.textContent = gameState.playerCoins;
                        } 
                        // If player is falling on enemy
                        else if (this.velocityY > 0 && this.y + this.height < enemy.y + enemy.height / 2) {
                            enemy.active = false;
                            this.velocityY = -this.jumpForce / 1.5;
                            gameState.playerCoins += 5;
                            coinsCount.textContent = gameState.playerCoins;
                        } else if (this.invincible === 0) {
                            takeDamage(20);
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
                    
                    showLevelComplete();
                    setTimeout(() => {
                        if (gameState.currentLevel < 3) {
                            gameState.currentLevel++;
                            loadLevel(gameState.currentLevel);
                        } else {
                            // Game completed
                            winScreen.style.display = 'flex';
                            gameState.gameRunning = false;
                        }
                    }, 2000);
                }
            }
            
            draw() {
                // Draw player as emoji with effects
                ctx.save();
                if (this.invincible > 0 && this.invincible % 10 < 5) {
                    ctx.globalAlpha = 0.5;
                }
                
                ctx.font = `bold ${this.height}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#ff6b6b';
                ctx.shadowBlur = 15;
                ctx.fillText(this.character, this.x + this.width/2, this.y + this.height/2);
                
                // Draw attack effect if attacking
                if (this.attackCooldown > 0) {
                    ctx.fillStyle = 'rgba(255, 107, 107, 0.7)';
                    ctx.beginPath();
                    ctx.arc(
                        this.x + this.width/2 + (this.facing * 40), 
                        this.y + this.height/2, 
                        25, 0, Math.PI * 2
                    );
                    ctx.fill();
                    
                    // Draw sword slash effect
                    ctx.strokeStyle = '#4cc9f0';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(this.x + this.width/2, this.y + this.height/2 - 10);
                    ctx.lineTo(this.x + this.width/2 + (this.facing * 50), this.y + this.height/2 - 10);
                    ctx.stroke();
                }
                
                ctx.restore();
            }
            
            jump() {
                if (!this.isJumping) {
                    this.velocityY = -this.jumpForce;
                    this.isJumping = true;
                }
            }
            
            attack() {
                if (this.attackCooldown === 0) {
                    this.attackCooldown = 25;
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
                // Platform with gradient
                const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(1, '#a7c957');
                ctx.fillStyle = gradient;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                // Add platform texture
                ctx.fillStyle = '#a7c957';
                for (let i = 0; i < this.width; i += 20) {
                    ctx.fillRect(this.x + i, this.y, 10, 3);
                }
                
                // Platform shadow
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetY = 5;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.shadowColor = 'transparent';
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
                this.animation = 0;
            }
            
            update() {
                if (!this.active) return;
                
                this.x += this.speed * this.direction;
                this.animation += 0.1;
                
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
                
                // Draw enemy as devil emoji with effects
                ctx.save();
                ctx.font = `bold ${this.height}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#800080';
                ctx.shadowBlur = 10;
                ctx.fillText('😈', this.x + this.width/2, this.y + this.height/2 + Math.sin(this.animation) * 3);
                
                // Draw demon aura
                ctx.strokeStyle = 'rgba(128, 0, 128, 0.7)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2 + 5, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.restore();
            }
        }
        
        // Coin class
        class Coin {
            constructor(x, y, width = 25, height = 25) {
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
                // Draw coin as gem emoji with effects
                ctx.save();
                ctx.font = `bold ${this.height}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#4cc9f0';
                ctx.shadowBlur = 15;
                ctx.fillText('💎', this.x + this.width/2, this.y + this.height/2 + Math.sin(this.animation) * 5);
                
                // Add shine effect with rotation
                ctx.save();
                ctx.translate(this.x + this.width/2, this.y + this.height/2);
                ctx.rotate(this.animation);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillRect(-3, -this.height/3, 6, this.height/3);
                ctx.restore();
                
                ctx.restore();
            }
        }
        
        // Flag class (end of level)
        class Flag {
            constructor(x, y, width = 50, height = 70) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
                this.animation = 0;
            }
            
            update() {
                this.animation += 0.05;
            }
            
            draw() {
                this.update();
                
                // Draw flag as Japanese shrine/torii gate emoji with effects
                ctx.save();
                ctx.font = `bold ${this.height}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#ff6b6b';
                ctx.shadowBlur = 20;
                ctx.fillText('⛩️', this.x + this.width/2, this.y + this.height/2);
                
                // Draw light beam
                ctx.fillStyle = 'rgba(255, 107, 107, 0.3)';
                ctx.beginPath();
                ctx.moveTo(this.x + this.width/2, this.y + this.height);
                ctx.lineTo(this.x + this.width/2 - 30, canvas.height);
                ctx.lineTo(this.x + this.width/2 + 30, canvas.height);
                ctx.closePath();
                ctx.fill();
                
                // Draw particles around flag
                for (let i = 0; i < 5; i++) {
                    const angle = this.animation + (i * Math.PI * 2 / 5);
                    const radius = 30;
                    const px = this.x + this.width/2 + Math.cos(angle) * radius;
                    const py = this.y + this.height/2 + Math.sin(angle) * radius;
                    
                    ctx.fillStyle = `rgba(255, ${107 + i*10}, ${107 + i*10}, 0.7)`;
                    ctx.beginPath();
                    ctx.arc(px, py, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.restore();
            }
        }
        
        // Level definitions
        const levels = {
            1: {
                name: "Floresta Assombrada",
                playerStart: { x: 50, y: 400 },
                platforms: [
                    new Platform(0, 500, 200, 30, '#6a994e'),
                    new Platform(250, 450, 200, 30, '#6a994e'),
                    new Platform(500, 400, 150, 30, '#6a994e'),
                    new Platform(700, 350, 100, 30, '#6a994e'),
                    new Platform(600, 250, 100, 30, '#6a994e'),
                    new Platform(400, 300, 100, 30, '#6a994e'),
                    new Platform(200, 350, 100, 30, '#6a994e'),
                    new Platform(50, 250, 100, 30, '#6a994e')
                ],
                enemies: [
                    new Enemy(300, 430, 35, 35, 2),
                    new Enemy(550, 380, 35, 35, 2),
                    new Enemy(200, 330, 35, 35, 2)
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
                    new Platform(0, 500, 150, 30, '#6a994e'),
                    new Platform(200, 450, 150, 30, '#6a994e'),
                    new Platform(400, 400, 150, 30, '#6a994e'),
                    new Platform(600, 350, 150, 30, '#6a994e'),
                    new Platform(500, 250, 150, 30, '#6a994e'),
                    new Platform(300, 300, 150, 30, '#6a994e'),
                    new Platform(100, 350, 150, 30, '#6a994e'),
                    new Platform(200, 200, 150, 30, '#6a994e'),
                    new Platform(400, 150, 150, 30, '#6a994e')
                ],
                enemies: [
                    new Enemy(250, 430, 35, 35, 2.5),
                    new Enemy(450, 380, 35, 35, 2.5),
                    new Enemy(350, 280, 35, 35, 2.5),
                    new Enemy(550, 230, 35, 35, 2.5)
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
                    new Platform(0, 500, 100, 30, '#6a994e'),
                    new Platform(150, 450, 100, 30, '#6a994e'),
                    new Platform(300, 400, 100, 30, '#6a994e'),
                    new Platform(450, 350, 100, 30, '#6a994e'),
                    new Platform(600, 300, 100, 30, '#6a994e'),
                    new Platform(600, 200, 100, 30, '#6a994e'),
                    new Platform(450, 250, 100, 30, '#6a994e'),
                    new Platform(300, 300, 100, 30, '#6a994e'),
                    new Platform(150, 350, 100, 30, '#6a994e'),
                    new Platform(0, 250, 100, 30, '#6a994e'),
                    new Platform(150, 150, 100, 30, '#6a994e'),
                    new Platform(300, 100, 100, 30, '#6a994e')
                ],
                enemies: [
                    new Enemy(180, 430, 35, 35, 3),
                    new Enemy(330, 380, 35, 35, 3),
                    new Enemy(480, 330, 35, 35, 3),
                    new Enemy(630, 280, 35, 35, 3),
                    new Enemy(480, 230, 35, 35, 3),
                    new Enemy(330, 280, 35, 35, 3),
                    new Enemy(180, 330, 35, 35, 3)
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
            trailerScreen.style.display = 'none';
            levelComplete.style.display = 'none';
        }
        
        // Reset player to level start
        function resetPlayer() {
            const level = levels[gameState.currentLevel];
            gameState.player = new Player(
                level.playerStart.x, 
                level.playerStart.y, 
                45, 45
            );
            gameState.player.character = selectedCharacter;
            gameState.health = 100;
            updateHealthBar();
        }
        
        // Show level complete effect
        function showLevelComplete() {
            levelComplete.style.display = 'flex';
            setTimeout(() => {
                levelComplete.style.display = 'none';
            }, 2000);
        }
        
        // Take damage
        function takeDamage(amount) {
            gameState.health -= amount;
            if (gameState.health < 0) gameState.health = 0;
            updateHealthBar();
            
            gameState.player.invincible = 60; // 1 second of invincibility
            
            if (gameState.health <= 0) {
                loseLife();
            }
        }
        
        // Update health bar
        function updateHealthBar() {
            healthFill.style.width = `${gameState.health}%`;
        }
        
        // Lose a life
        function loseLife() {
            gameState.lives--;
            livesCount.textContent = gameState.lives;
            
            if (gameState.lives <= 0) {
                gameOverScreen.style.display = 'flex';
                gameState.gameRunning = false;
            } else {
                resetPlayer();
            }
        }
        
        // Reset game state
        function resetGame() {
            gameState.lives = 3;
            gameState.playerCoins = 0;
            gameState.currentLevel = 1;
            gameState.health = 100;
            livesCount.textContent = gameState.lives;
            coinsCount.textContent = gameState.playerCoins;
            levelDisplay.textContent = gameState.currentLevel;
            updateHealthBar();
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
        
        watchTrailerBtn.addEventListener('click', () => {
            winScreen.style.display = 'none';
            trailerScreen.style.display = 'flex';
        });
        
        playAgainBtn.addEventListener('click', () => {
            resetGame();
            loadLevel(1);
            gameLoop();
        });
        
        backAfterTrailerBtn.addEventListener('click', () => {
            trailerScreen.style.display = 'none';
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
        window.addEventListener('load', () => {
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                menuScreen.style.display = 'flex';
                loadBackgrounds();
                createParticles();
                resetGame();
            }, 2000);
        });