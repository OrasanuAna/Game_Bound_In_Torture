// Select the existing canvas from HTML
const canvas = document.getElementById("gameCanvas");

// Ensure PixiJS correctly attaches to the existing canvas
const app = new PIXI.Application({
  view: canvas,
  width: canvas.clientWidth,
  height: canvas.clientHeight,
  backgroundAlpha: 0,
  backgroundTexture: PIXI.Texture.from("assets/chamber-Four-background.jpg"),
});

// Resize PixiJS when the window resizes
window.addEventListener("resize", () => {
  app.renderer.resize(canvas.clientWidth, canvas.clientHeight);
});

// Function to create a platform
function createPlatform(x, y, width, height) {
  const platform = new PIXI.Graphics();
  platform.beginFill(0x8b4513);
  platform.drawRect(0, 0, width, height);
  platform.endFill();
  platform.x = x;
  platform.y = y;
  app.stage.addChild(platform);
  return platform;
}

// Create the ground
const groundWidth = app.renderer.width;
const groundHeight = app.renderer.height * 0.05;

const metalWidth = app.renderer.width * 0.1;
const metalHeight = app.renderer.height * 0.2;

const ground = createPlatform(
  0,
  app.renderer.height - groundHeight,
  groundWidth,
  groundHeight
);

// Load metal textures
const metalTextureBefore = PIXI.Texture.from("assets/ironMainden.png");
const metalTextureAfter = PIXI.Texture.from("assets/ironMainden2.png");

const metalObject = new PIXI.Sprite(metalTextureBefore);
metalObject.scale.x = -1;
metalObject.x = app.renderer.width - metalWidth;
metalObject.y = app.renderer.height - metalHeight;
metalObject.width = 50;
metalObject.height = 100;
metalObject.alpha = 0; // Invisible but still collidable
app.stage.addChild(metalObject);

// Load running animation frames for the character
const runFrames = [
  PIXI.Texture.from("assets/frame1.png"),
  PIXI.Texture.from("assets/frame2.png"),
  PIXI.Texture.from("assets/frame3.png"),
  PIXI.Texture.from("assets/frame4.png"),
  PIXI.Texture.from("assets/frame5.png"),
  PIXI.Texture.from("assets/frame6.png"),
  PIXI.Texture.from("assets/frame7.png"),
  PIXI.Texture.from("assets/frame8.png"),
];

// Create the player sprite
const player = new PIXI.AnimatedSprite(runFrames);
player.x = 100;
player.y = app.renderer.height - groundHeight - 80;
player.width = 50;
player.height = 80;
player.scale.set(0.2, 0.2);
player.anchor.set(0.5, 1);
player.animationSpeed = 0.15;
player.loop = true;
player.play();
app.stage.addChild(player);

// Movement variables
let speed = 4;
let gravity = 1;
let velocityY = 0;
let isJumping = false;
let keys = {};
let gameEnded = false;

// Listen for keydown and keyup
window.addEventListener("keydown", (e) => (keys[e.code] = true));
window.addEventListener("keyup", (e) => (keys[e.code] = false));

const backgroundTexture = PIXI.Texture.from(
  "assets/chamber-Four-background.jpg"
);

// Ensure the texture is fully loaded before using it
backgroundTexture.baseTexture.on("loaded", () => {
  console.log("Background loaded successfully!");
});

// Create background sprite
const backgroundSprite = new PIXI.Sprite(backgroundTexture);

// Dialogue sequence (triggers when touching the letter)
const dialogues = [{ speaker: "Vespera", text: "You found me." }];

let currentDialogueIndex = 0;
let dialogueActive = false;

// Make sure it covers the entire canvas
backgroundSprite.width = app.renderer.width;
backgroundSprite.height = app.renderer.height;
backgroundSprite.zIndex = -1;

// Add to stage
app.stage.addChildAt(backgroundSprite, 0);

// Jump function
function jump() {
  if (!isJumping) {
    velocityY = -15;
    isJumping = true;
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

// Function to check collision with the ground
function checkGroundCollision(player, ground) {
  if (player.y + player.height >= ground.y) {
    player.y = ground.y - player.height;
    velocityY = 0;
    isJumping = false;
  }
}

function isColliding(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

const darkOverlay = new PIXI.Graphics();
darkOverlay.beginFill(0x000000, 0); // Fully transparent
darkOverlay.drawRect(0, 0, app.renderer.width, app.renderer.height);
darkOverlay.endFill();
darkOverlay.zIndex = 10;
app.stage.addChild(darkOverlay);

const metalSound = new Audio("assets/the-end.mp3"); // Replace with actual file path

function endGame() {
  triggerDialogue();
  gameEnded = true;

  metalSound.play();

  let opacity = 0;
  const fadeInterval = setInterval(() => {
    opacity += 0.02; // Gradually increase darkness
    darkOverlay.clear();
    darkOverlay.beginFill(0x000000, opacity);
    darkOverlay.drawRect(0, 0, app.renderer.width, app.renderer.height);
    darkOverlay.endFill();

    if (opacity >= 1) {
      clearInterval(fadeInterval);
      setTimeout(() => {
        window.location.href = "credits.html";
      }, 7000);
    }
  }, 100); // Darkens gradually over ~5 seconds
}

// Game loop
app.ticker.add(() => {
  if (gameEnded) return;

  let isMoving = false;

  if (keys["ArrowLeft"] && player.x > 0) {
    player.x -= speed;
    if (player.scale.x > 0) player.scale.x = -0.2;
    isMoving = true;
  }

  if (keys["ArrowRight"] && player.x + player.width < app.renderer.width) {
    player.x += speed;
    if (player.scale.x < 0) player.scale.x = 0.2;
    isMoving = true;
  }

  if (isMoving && !isJumping) {
    if (!player.playing || player.textures !== runFrames) {
      player.textures = runFrames;
      player.animationSpeed = 0.15;
      player.play();
    }
  } else if (!isMoving && !isJumping) {
    player.stop();
  }

  // Apply gravity
  velocityY += gravity;
  player.y += velocityY;

  // Check collision with the ground
  checkGroundCollision(player, ground);

  // Check if player touches the metal object (Ends the game)
  if (isColliding(player, metalObject)) {
    endGame();
  }
});
