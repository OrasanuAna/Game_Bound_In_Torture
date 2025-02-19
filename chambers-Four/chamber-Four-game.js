// Select the existing canvas from HTML
const canvas = document.getElementById("gameCanvas");

// Ensure PixiJS correctly attaches to the existing canvas
const app = new PIXI.Application({
    view: canvas,
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    backgroundColor: 0x1099bb
});

// Resize PixiJS when the window resizes
window.addEventListener("resize", () => {
    app.renderer.resize(canvas.clientWidth, canvas.clientHeight);
});

// Function to create a platform
function createPlatform(x, y, width, height) {
    const platform = new PIXI.Graphics();
    platform.beginFill(0x8B4513);
    platform.drawRect(0, 0, width, height);
    platform.endFill();
    platform.x = x;
    platform.y = y;
    platform.width = width;
    platform.height = height;
    app.stage.addChild(platform);
    return platform;
}


const groundWidth = app.renderer.width * 1.0; 
const groundHeight = app.renderer.height * 0.20;


const metalWidth = app.renderer.width * 0.1; 
const metalHeight = app.renderer.height * 0.328;


const ground = createPlatform(0, app.renderer.height - groundHeight, groundWidth, groundHeight);

const metalObject = new PIXI.Graphics();
metalObject.beginFill(0xA9A9A9); // Metallic gray
metalObject.drawRect(300, 0, 50, 100);
metalObject.endFill();
metalObject.x = app.renderer.width / 2 - metalWidth;
metalObject.y = app.renderer.height - metalHeight;
app.stage.addChild(metalObject);

// Create the player (blue cube)
const cube = new PIXI.Graphics();
cube.beginFill(0x349457);
cube.drawRect(0, 0, 50, 50);
cube.endFill();
cube.x = 100;
cube.y = 500;
cube.width = 50;
cube.height = 50;
app.stage.addChild(cube);

// Movement variables
let speed = 5;
let gravity = 1;
let velocityY = 0;
let isJumping = false;
let keys = {};
let onMovingPlatform = false;

// Listen for keydown and keyup
window.addEventListener("keydown", (e) => keys[e.code] = true);
window.addEventListener("keyup", (e) => keys[e.code] = false);

// Jump function
function jump() {
    if (!isJumping) {
        velocityY = -17;
        isJumping = true;
    }
}

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") jump();
});

// Function to check collision (Rectangular Objects)
function isColliding(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Function to handle platform collision
function checkPlatformCollision(player, platform) {
    if (player.y + player.height > platform.y &&
        player.y + player.height - velocityY <= platform.y &&
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width) {
        
        player.y = platform.y - player.height;
        velocityY = 0;
        isJumping = false;
    }
}

// Function to end the game
function endGame() {
    document.querySelector(".character-text").innerText = "Vespera: You reached the end!";
    setTimeout(() => {
        window.location.href = "../start-game/start-game.html";
    }, 3000);
}

// 🆕 **Animation: Move Player to the Center at Start**
function moveToCenter() {
    let targetX = app.renderer.width / 2 - cube.width / 2;
    let targetY = ground.y - cube.height;
    
    let moveSpeed = 2; // Speed of movement
    let moveInterval = setInterval(() => {
        if (Math.abs(cube.x - targetX) < moveSpeed) {
            cube.x = targetX;
        } else {
            cube.x += cube.x < targetX ? moveSpeed : -moveSpeed;
        }

        if (Math.abs(cube.y - targetY) < moveSpeed) {
            cube.y = targetY;
            clearInterval(moveInterval); // Stop the movement
        } else {
            cube.y += cube.y < targetY ? moveSpeed : -moveSpeed;
        }
    }, 16); // Run every 16ms for smooth movement
}

// Start moving the player when the game starts
moveToCenter();

// Game loop
app.ticker.add(() => {
    // Left/Right movement
    if (keys["ArrowLeft"] && cube.x > 0) cube.x -= speed;
    if (keys["ArrowRight"] && cube.x + cube.width < app.renderer.width) cube.x += speed;

    // Apply gravity
    velocityY += gravity;
    cube.y += velocityY;

    // Keep player inside game boundaries
    if (cube.y + cube.height > app.renderer.height) {
        cube.y = app.renderer.height - cube.height;
        velocityY = 0;
        isJumping = false;
    }

    // Check collision with platforms
    checkPlatformCollision(cube, ground);

    // Check if player touches the metal object (Ends the game)
    if (isColliding(cube, metalObject)) {
        endGame();
    }
});
