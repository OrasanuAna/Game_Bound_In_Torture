// Select the existing canvas from HTML
const canvas = document.getElementById("gameCanvas");

// Ensure PixiJS correctly attaches to the existing canvas
const app = new PIXI.Application({
    view: canvas,
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    backgroundColor: 0x1099bb
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
// Resize PixiJS when the window resizes
window.addEventListener("resize", () => {
    app.renderer.resize(canvas.clientWidth, canvas.clientHeight);
});


const groundWidth = app.renderer.width * 1.0; 
const groundHeight = app.renderer.height * 0.20;

const ground = createPlatform(0, app.renderer.height - groundHeight, groundWidth, groundHeight);
const platform1 = createPlatform(300, 500, 200, 30);
const platform2 = createPlatform(600, 400, 200, 30);
const platform3 = createPlatform(50, 225, 200, 30);
const platform4 = createPlatform(300, 300, 200, 30);
const verticalBarrier = createPlatform(875, 300, 40, 450); // Shorter barrier

// Function to create a triangular obstacle with gravity
function createTriangleObstacle(x, y) {
    const obstacle = new PIXI.Graphics();
    obstacle.beginFill(0xFF0000);
    obstacle.moveTo(0, 0); // Top
    obstacle.lineTo(25, 50); // Bottom-right
    obstacle.lineTo(-25, 50); // Bottom-left
    obstacle.lineTo(0, 0);
    obstacle.endFill();
    
    obstacle.x = x;
    obstacle.y = y;
    obstacle.width = 20;
    obstacle.height = 20;
    obstacle.velocityY = 0;
    obstacle.points = [
        { x: x, y: y }, 
        { x: x + 10, y: y + 20 }, 
        { x: x - 10, y: y + 20 }
    ];
    app.stage.addChild(obstacle);
    return obstacle;
}

// Create obstacles
const obstacles = [
    createTriangleObstacle(400, 270) // Small spike
];

// Load sprite textures
const spriteFrames = [
    PIXI.Texture.from("/assets/frame1.png"),
    PIXI.Texture.from("/assets/frame2.png"),
    PIXI.Texture.from("/assets/frame3.png"),
    PIXI.Texture.from("/assets/frame4.png")
];

// Create an animated sprite
const player = new PIXI.AnimatedSprite(spriteFrames);

// Set up initial properties
player.x = 100;
player.y = 500;
player.scale.set(0.1); // ✅ Set to 1 to keep the original size

player.animationSpeed = 0.15; // Adjust speed
player.loop = true; // ✅ Ensure looping
player.play(); // Start animation

app.stage.addChild(player);

// Create the door (goal)
const door = new PIXI.Graphics();
door.beginFill(0x228B22);
door.drawRect(0, 0, 50, 80);
door.endFill();
door.x = 1050;
door.y = 545;
door.width = 50;
door.height = 80;
app.stage.addChild(door);

// Movement variables
let speed = 5;
let gravity = 1;
let velocityY = 0;
let isJumping = false;
let keys = {};
let movingUp = true;
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

// Function to check collision with triangular obstacles
function isCollidingWithTriangle(player, triangle) {
    let playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };
    for (let i = 0; i < triangle.points.length; i++) {
        let p1 = triangle.points[i];
        let p2 = triangle.points[(i + 1) % triangle.points.length];

        if (
            playerRect.x < Math.max(p1.x, p2.x) &&
            playerRect.x + playerRect.width > Math.min(p1.x, p2.x) &&
            playerRect.y < Math.max(p1.y, p2.y) &&
            playerRect.y + playerRect.height > Math.min(p1.y, p2.y)
        ) {
            return true;
        }
    }
    return false;
}

function checkPlatformCollision(player, platform) {
    if (player.y + player.height > platform.y &&
        player.y + player.height - velocityY <= platform.y &&
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width) {
        
        player.y = platform.y - player.height;
        velocityY = 0;
        isJumping = false;
    }

    if (player.y < platform.y + platform.height &&
        player.y - velocityY >= platform.y + platform.height &&
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width) {
        
        player.y = platform.y + platform.height;
        velocityY = 1;
    }

    if (player.x + player.width > platform.x && player.x < platform.x + platform.width) {
        if (player.y + player.height > platform.y && player.y < platform.y + platform.height) {
            // Player is moving RIGHT and collides with the LEFT side of the platform
            if (keys["ArrowRight"]) {
                player.x = platform.x - player.width;
            }
            // Player is moving LEFT and collides with the RIGHT side of the platform
            if (keys["ArrowLeft"]) {
                player.x = platform.x + platform.width;
            }
        }
    }
}

// Create the special object on Platform 4 (Interactive)
const secretObject = new PIXI.Graphics();
secretObject.beginFill(0xFFD700); // Gold color
secretObject.drawRect(0, 0, 30, 30);
secretObject.endFill();
secretObject.x = platform3.x + platform3.width / 2 - 15;
secretObject.y = platform3.y - 30;
secretObject.width = 30;
secretObject.height = 30;
app.stage.addChild(secretObject);

let secretObjectExists = true; // Track if the object is still active

// Function to show the modal
function showModal(message) {
    const modal = document.getElementById("messageModal");
    const modalText = document.getElementById("modal-text");
    const closeButton = document.querySelector(".close-btn");

    modalText.innerText = message;
    modal.style.display = "block";

    closeButton.onclick = () => {
        modal.style.display = "none";
    };
}

// Function to move to the next level
function goToNextLevel() {
    let currentLevel = window.location.pathname; // Get current file path

    if (currentLevel.includes("chamber-One")) {
        window.location.href = "/chamber-Two/chamber-Two.html"; // Move to Chamber Two
    }
}


// Game loop
app.ticker.add(() => {

    let isMoving = false;

    if (keys["ArrowLeft"] && player.x > 0) {
        player.x -= speed;
        player.scale.x = -2; // ✅ Flip sprite to face left
        isMoving = true;
    }
    if (keys["ArrowRight"] && player.x + player.width < app.renderer.width) {
        player.x += speed;
        player.scale.x = 2; // ✅ Face right
        isMoving = true;
    }

    // ✅ Fix: Start animation only when moving
    if (isMoving) {
        if (!player.playing) player.play();
    } else {
        player.stop(); // Stop animation when idle
    }

    // Apply gravity (only if not on the moving platform)
    if (!onMovingPlatform) {
        velocityY += gravity;
        player.y += velocityY;
    }

    // Keep player inside game boundaries
    if (player.y + player.height > app.renderer.height) {
        player.y = app.renderer.height - player.height;
        velocityY = 0;
        isJumping = false;
    }

     // Check collision with platforms
     [ground, platform1, platform2, platform3, platform4].forEach(platform => checkPlatformCollision(player, platform));


        // Fix: Block the player from passing through the vertical barrier
        if (isColliding(player, verticalBarrier)) {
            if (player.x + player.width > verticalBarrier.x && player.x < verticalBarrier.x + verticalBarrier.width / 2) {
                // Block movement from the left side
                player.x = verticalBarrier.x - player.width;
            } else if (player.x < verticalBarrier.x + verticalBarrier.width && player.x + player.width > verticalBarrier.x + verticalBarrier.width / 2) {
                // Block movement from the right side
                player.x = verticalBarrier.x + verticalBarrier.width;
            }
        }

    // Gravity for obstacles (Fix: Update collision points dynamically)
    obstacles.forEach(obstacle => {
        // Apply gravity
        obstacle.velocityY += gravity;
        obstacle.y += obstacle.velocityY;

        let isOnPlatform = false;

        // Check collision with platforms
        [ground, platform1, platform2, platform3, platform4].forEach(platform => {
            if (isColliding(obstacle, platform)) {
                obstacle.y = platform.y - obstacle.height; // Stop falling
                obstacle.velocityY = 0;
                isOnPlatform = true;
            }
        });

        // If not on a platform, keep falling
        if (!isOnPlatform) {
            obstacle.velocityY += gravity;
        }

        // 🛠️ Fix: Update the collision points based on the new position
        obstacle.points = [
            { x: obstacle.x, y: obstacle.y },
            { x: obstacle.x + 10, y: obstacle.y + 20 },
            { x: obstacle.x - 10, y: obstacle.y + 20 }
        ];


    });


    // Check if player collides with a triangular obstacle (Fixed)
    obstacles.forEach(obstacle => {
        if (isCollidingWithTriangle(player, obstacle)) {
            player.x = 100;
            player.y = 500;
            velocityY = 0;
            isJumping = false;

            // Fix: Change text in `.character-text`, not `info-box`
            let textBox = document.querySelector(".character-text");
            if (textBox) {
                textBox.innerText = "Vespera: You hit an obstacle!";
            }
        }
    });

    // Check if player reaches the door
    if (isColliding(player, door)) {
        document.querySelector(".character-text").innerText = "Vespera: You completed the level!";

        // Wait for 2 seconds before moving to the next level
        setTimeout(goToNextLevel, 2000);
    }



    // Check if the player collides with the object and it exists
    if (secretObjectExists && isColliding(player, secretObject)) {
        showModal("You found a hidden message! Well done!");
        app.stage.removeChild(secretObject); // Remove from the game
        secretObjectExists = false; // Mark as removed
    }
});
