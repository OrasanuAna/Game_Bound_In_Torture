// Select the existing canvas from HTML
const canvas = document.getElementById("gameCanvas");

// Ensure PixiJS correctly attaches to the existing canvas
const app = new PIXI.Application({
  view: canvas,
  width: canvas.clientWidth,
  height: canvas.clientHeight,
  backgroundAlpha: 0,
  backgroundTexture: PIXI.Texture.from("/assets/chamber-One-background.jpg"),
});

// Function to create a platform with an image texture
function createPlatform(x, y, width, height, texturePath = null) {
  let platform;

  if (texturePath) {
    // ✅ If a texture path is provided, create a Sprite
    const texture = PIXI.Texture.from(texturePath);
    platform = new PIXI.Sprite(texture);
    platform.width = width;
    platform.height = height;
  } else {
    // ✅ If no texture is provided, create a colored rectangle platform
    platform = new PIXI.Graphics();
    platform.beginFill(0x8b4513); // Brown color
    platform.drawRect(0, 0, width, height);
    platform.endFill();
  }

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
const groundHeight = app.renderer.height * 0.05;

const ground = createPlatform(
  0,
  app.renderer.height - groundHeight,
  groundWidth,
  groundHeight
);
const platform1 = createPlatform(350, 640, 250, 30, "/assets/platform2.png");
const platform2 = createPlatform(550, 500, 200, 30, "/assets/platform2.png");
const platform3 = createPlatform(50, 275, 200, 30, "/assets/platform6.png");
const platform4 = createPlatform(200, 350, 300, 30, "/assets/platform2.png");
const platform5 = createPlatform(50, 225, 200, 60, "/assets/platform5.png");
const platform6 = createPlatform(270, 640, 250, 30, "/assets/platform2.png");
const platform7 = createPlatform(480, 500, 200, 30, "/assets/platform2.png");
const verticalBarrier = createPlatform(
  775,
  400,
  50,
  450,
  "/assets/vertical.png"
);

// Function to create a triangular obstacle with an optional texture
function createTriangleObstacle(x, y, texturePath = null) {
  let obstacle;

  if (texturePath) {
    // ✅ If a texture path is provided, create a sprite
    const texture = PIXI.Texture.from(texturePath);
    obstacle = new PIXI.Sprite(texture);
    obstacle.width = 30; // Adjust width to fit design
    obstacle.height = 30; // Adjust height to fit design
  } else {
    // ✅ If no texture is provided, create a colored triangle
    obstacle = new PIXI.Graphics();
    obstacle.beginFill(0xff0000); // Red color for default obstacle
    obstacle.moveTo(0, 0); // Top
    obstacle.lineTo(25, 50); // Bottom-right
    obstacle.lineTo(-25, 50); // Bottom-left
    obstacle.lineTo(0, 0);
    obstacle.endFill();
  }

  // Positioning the obstacle
  obstacle.x = x;
  obstacle.y = y;
  obstacle.velocityY = 0;
  obstacle.points = [
    { x: x, y: y },
    { x: x + 10, y: y + 20 },
    { x: x - 10, y: y + 20 },
  ];

  // Add the obstacle to the stage
  app.stage.addChild(obstacle);
  return obstacle;
}

// Create obstacles
const obstacles = [
  createTriangleObstacle(300, 300, "/assets/jumping-spike.png"), // Small spike
];

// Load running animation frames for the character
const runFrames = [
  PIXI.Texture.from("/assets/frame1.png"),
  PIXI.Texture.from("/assets/frame2.png"),
  PIXI.Texture.from("/assets/frame3.png"),
  PIXI.Texture.from("/assets/frame4.png"),
  PIXI.Texture.from("/assets/frame5.png"),
  PIXI.Texture.from("/assets/frame6.png"),
  PIXI.Texture.from("/assets/frame7.png"),
  PIXI.Texture.from("/assets/frame8.png"),
];

const jumpFrames = [
  PIXI.Texture.from("/assets/jump-frame1.png"),
  PIXI.Texture.from("/assets/jump-frame5.png"),
  PIXI.Texture.from("/assets/jump-frame9.png"),
  PIXI.Texture.from("/assets/jump-frame10.png"),
];

// Create the player sprite
const player = new PIXI.AnimatedSprite(runFrames);

// Set up player position and size
player.x = 100;
player.y = 500;
player.width = 50; // ✅ Manually setting width
player.height = 80; // ✅ Manually setting height
player.scale.set(0.17, 0.17); // Keep the sprite proportional
player.anchor.set(0.5, 0); // Centered correctly
player.animationSpeed = 0.1;
player.loop = true;
player.play();

app.stage.addChild(player);

// Create the door (goal)
const door = new PIXI.Graphics();
door.beginFill();
door.drawRect(0, 0, 50, 80);
door.endFill();
door.x = 850;
door.y = 745;
door.width = 500;
door.height = 80;
app.stage.addChild(door);

// Movement variables
let speed = 4;
let gravity = 0.6;
let velocityY = 0;
let isJumping = false;
let keys = {};
let movingUp = true;
let onMovingPlatform = false;

// Listen for keydown and keyup
window.addEventListener("keydown", (e) => (keys[e.code] = true));
window.addEventListener("keyup", (e) => (keys[e.code] = false));

const backgroundTexture = PIXI.Texture.from(
  "/assets/chamber-One-background.jpg"
);

// Ensure the texture is fully loaded before using it
backgroundTexture.baseTexture.on("loaded", () => {
  console.log("Background loaded successfully!");
});

// Create background sprite
const backgroundSprite = new PIXI.Sprite(backgroundTexture);

// Make sure it covers the entire canvas
backgroundSprite.width = app.renderer.width;
backgroundSprite.height = app.renderer.height;
backgroundSprite.zIndex = -1;

// Add to stage
app.stage.addChildAt(backgroundSprite, 0);

// Dialogue sequence (triggers when touching the letter)
const dialogues = [
  {
    speaker: "Aldric",
    text: "This handwriting… it feels familiar. These words… once made me feel safe. Why can’t I remember?",
  },
  {
    speaker: "Vespera",
    text: "Perhaps you are lost. Or maybe you wanted to forget. Everything returns when you choose to see it.",
  },
  {
    speaker: "Aldric",
    text: "What is this? A… totem? How is it connected to all this?",
  },
  {
    speaker: "Vespera",
    text: "It’s more than an object. A gateway. A bond tying us to the shadows.",
  },
];

let currentDialogueIndex = 0;
let dialogueActive = false;

// Jump function
function jump() {
  if (!isJumping) {
    velocityY = -14;
    isJumping = true;

    // ✅ Switch to jump animation
    player.textures = jumpFrames;
    player.animationSpeed = 0.15; // Slower jump animation
    player.play();
  }
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});

function showDialogue() {
  if (currentDialogueIndex < dialogues.length) {
    document.querySelector(".character-name").innerText =
      dialogues[currentDialogueIndex].speaker;
    document.querySelector(".character-text").innerText =
      dialogues[currentDialogueIndex].text;
    currentDialogueIndex++;

    // Hide the next button on the last dialogue
    if (currentDialogueIndex === dialogues.length) {
      document.querySelector(".next-button").style.display = "none";
    }
  } else {
    dialogueActive = false;
    movementPaused = false; // Allow player to move again
    document.querySelector(".next-button").style.display = "block"; // Reset for future use
    document
      .querySelector(".next-button")
      .removeEventListener("click", showDialogue);
  }
}

// Function to trigger dialogue when the player touches the letter
function triggerDialogue() {
  dialogueActive = true;
  document.querySelector(".text-box").style.display = "flex";
  showDialogue();
  document
    .querySelector(".next-button")
    .addEventListener("click", showDialogue);
}

// Function to check collision (Rectangular Objects)
function isColliding(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Function to check collision with triangular obstacles
function isCollidingWithTriangle(player, triangle) {
  let playerRect = {
    x: player.x,
    y: player.y,
    width: player.width,
    height: player.height,
  };
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
  // ✅ Prevent falling through platform
  if (
    player.y + player.height > platform.y &&
    player.y + player.height - velocityY <= platform.y && // Check last frame position
    player.x + player.width > platform.x &&
    player.x < platform.x + platform.width
  ) {
    player.y = platform.y - player.height; // ✅ Land on platform
    velocityY = 0;
    isJumping = false;
  }

  // ✅ Prevent getting stuck below platform
  if (
    player.y < platform.y + platform.height &&
    player.y - velocityY >= platform.y + platform.height && // Check last frame position
    player.x + player.width > platform.x &&
    player.x < platform.x + platform.width
  ) {
    player.y = platform.y + platform.height; // ✅ Prevent getting stuck
    velocityY = 1;
  }

  if (
    player.x + player.width > platform.x &&
    player.x < platform.x + platform.width
  ) {
    if (
      player.y + player.height > platform.y &&
      player.y < platform.y + platform.height
    ) {
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

// Load the letter texture
const letterTexture = PIXI.Texture.from("/assets/artefact2.png");

// Create the letter sprite as the secret object
const secretObject = new PIXI.Sprite(letterTexture);
secretObject.width = 30; // Set width
secretObject.height = 30; // Set height
secretObject.x = platform3.x + platform3.width / 2 - 25; // Center it on Platform 2
secretObject.y = platform3.y - 30; // Slightly above the platform
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
    window.location.href = "chamber-Two.html"; // Move to Chamber Two
  }
}

const idleFrames = [
  PIXI.Texture.from("/assets/idle-frame1.png"),
  PIXI.Texture.from("/assets/idle-frame2.png"),
  PIXI.Texture.from("/assets/idle-frame3.png"),
];

let isIdle = false;
let idleTimer = null; // Timer for idle animation
const idleDelay = 1000; // 3 seconds

function triggerIdleAnimation() {
  if (!isIdle && !keys["ArrowLeft"] && !keys["ArrowRight"]) {
    player.textures = idleFrames;
    player.animationSpeed = 0.1;
    player.loop = true;
    player.play();
    isIdle = true;
  }
}

// Game loop
app.ticker.add(() => {
  let isMoving = false;

  if (keys["ArrowLeft"] && player.x > 0) {
    player.x -= speed;
    if (player.scale.x > 0) player.scale.x = -0.17;
    isMoving = true;
  }

  if (keys["ArrowRight"] && player.x + player.width < app.renderer.width) {
    player.x += speed;
    if (player.scale.x < 0) player.scale.x = 0.17;
    isMoving = true;
  }

  // ✅ Fix: Play running animation only when moving on the ground
  if (isMoving && !isJumping) {
    if (!player.playing || player.textures !== runFrames) {
      player.textures = runFrames;
      player.animationSpeed = 0.15; // ✅ Running is faster
      player.play();
    }
  } else if (!isMoving && !isJumping) {
    player.stop();
  }

  // ✅ Detect movement and reset idle timer
  if (isMoving) {
    if (isIdle) {
      player.textures = runFrames; // Return to running animation
      player.animationSpeed = 0.15;
      player.loop = true;
      player.play();
      isIdle = false;
    }

    clearTimeout(idleTimer); // Reset idle timer
    idleTimer = setTimeout(() => {
      triggerIdleAnimation();
    }, idleDelay);
  }

  // ✅ Apply gravity
  velocityY += gravity;
  player.y += velocityY;

  // ✅ Fix: Reset jump animation when landing
  if (player.y > app.renderer.height - ground.height) {
    player.y = app.renderer.height - ground.height;
    velocityY = 0;
    isJumping = false;

    // ✅ Switch back to running animation when landing
    if (player.textures !== runFrames) {
      player.textures = runFrames;
      player.animationSpeed = 0.15; // ✅ Restore running speed
      player.play();
    }
  }

  // Check collision with platforms
  [ground, platform1, platform2, platform3, platform4].forEach((platform) =>
    checkPlatformCollision(player, platform)
  );

  // Fix: Block the player from passing through the vertical barrier
  if (isColliding(player, verticalBarrier)) {
    if (
      player.x + player.width > verticalBarrier.x &&
      player.x < verticalBarrier.x + verticalBarrier.width / 2
    ) {
      // Block movement from the left side
      player.x = verticalBarrier.x - player.width;
    } else if (
      player.x < verticalBarrier.x + verticalBarrier.width &&
      player.x + player.width > verticalBarrier.x + verticalBarrier.width / 2
    ) {
      // Block movement from the right side
      player.x = verticalBarrier.x + verticalBarrier.width;
    }
  }

  // Gravity for obstacles (Fix: Update collision points dynamically)
  obstacles.forEach((obstacle) => {
    // Apply gravity
    obstacle.velocityY += gravity;
    obstacle.y += obstacle.velocityY;

    let isOnPlatform = false;

    // Check collision with platforms
    [ground, platform1, platform2, platform3, platform4].forEach((platform) => {
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
      { x: obstacle.x - 10, y: obstacle.y + 20 },
    ];
  });

  // Check if player collides with a triangular obstacle (Fixed)
  obstacles.forEach((obstacle) => {
    if (isCollidingWithTriangle(player, obstacle)) {
      player.x = 100;
      player.y = 500;
      velocityY = 0;
      isJumping = false;
    }
  });

  // Check if player reaches the door
  if (isColliding(player, door)) {
    // Wait for 2 seconds before moving to the next level
    setTimeout(goToNextLevel, 2000);
  }

  // Check if the player collides with the letter
  if (secretObjectExists && isColliding(player, secretObject)) {
    triggerDialogue();

    // Remove letter from the game scene
    app.stage.removeChild(secretObject);
    secretObjectExists = false;

    // Add the letter to the second inventory slot
    document.querySelectorAll(
      ".inventory-slot"
    )[1].innerHTML = `<img src="/assets/artefact2.png" alt="Letter">`;
  }
});
