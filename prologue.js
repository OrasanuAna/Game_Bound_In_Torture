// Select the existing canvas from HTML
const canvas = document.getElementById("gameCanvas");

// Ensure PixiJS correctly attaches to the existing canvas
const app = new PIXI.Application({
  view: canvas,
  width: canvas.clientWidth,
  height: canvas.clientHeight,
  backgroundAlpha: 0,
});

// Load background texture
const backgroundTexture = PIXI.Texture.from("/assets/prologue-background.png");
const backgroundSprite = new PIXI.Sprite(backgroundTexture);
backgroundSprite.width = app.renderer.width;
backgroundSprite.height = app.renderer.height;
backgroundSprite.zIndex = -1;
app.stage.addChildAt(backgroundSprite, 0);

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

// Create the player sprite (character)
const player = new PIXI.AnimatedSprite(runFrames);
player.x = app.renderer.width; // Start in the middle
player.y = app.renderer.height - 130; // Position on the ground
player.width = 50;
player.height = 80;
player.scale.set(-0.2, 0.2); // Scale sprite properly
player.anchor.set(0.5, 1);
player.animationSpeed = 0.1;
player.loop = true;
player.play();
player.zIndex = 1;
app.stage.addChild(player);

// Create a secret object in the middle of the map
const secretTexture = PIXI.Texture.from("/assets/artefact1.png");
const secretObject = new PIXI.Sprite(secretTexture);
secretObject.x = app.renderer.width / 2 + 150; // Slightly to the right
secretObject.y = app.renderer.height - 140; // Near the ground
secretObject.width = 40;
secretObject.height = 40;
secretObject.anchor.set(0.5, 1);
app.stage.addChild(secretObject);

let secretObjectExists = true; // Track if the object is still active

// Movement variables
let speed = 3; // Speed of movement
let movementPaused = false; // Controls whether the player can move
let keys = {}; // Object to store key states
let transitioning = false; // Prevents multiple level transitions

// Listen for keydown and keyup events
window.addEventListener("keydown", (e) => (keys[e.code] = true));
window.addEventListener("keyup", (e) => (keys[e.code] = false));

// Function to move to the next level
function goToNextLevel() {
  if (!transitioning) {
    transitioning = true; // Prevent multiple triggers
    document.querySelector(".character-text").innerText = "The path opens...";
    setTimeout(() => {
      window.location.href = "chamber-One.html"; // Move to the next level
    }, 2000);
  }
}

// Game loop - update movement
app.ticker.add(() => {
  if (!movementPaused) {
    let isMoving = false;

    // Move left
    if (keys["ArrowLeft"] && player.x > 0) {
      player.x -= speed;
      if (player.scale.x > 0) player.scale.x = -0.2; // Flip sprite
      isMoving = true;
    }

    // Move right
    if (keys["ArrowRight"] && player.x < app.renderer.width) {
      player.x += speed;
      if (player.scale.x < 0) player.scale.x = 0.2; // Flip sprite
      isMoving = true;
    }

    // Start or stop animation
    if (isMoving) {
      if (!player.playing) player.play();
    } else {
      player.stop();
    }

    // Check if player collides with the secret object
    if (secretObjectExists && isColliding(player, secretObject)) {
      app.stage.removeChild(secretObject);
      secretObjectExists = false;
      player.stop(); // Stop animation while modal is open

      // Add the letter to the first inventory slot
      document.querySelectorAll(
        ".inventory-slot"
      )[0].innerHTML = `<img src="/assets/artefact1.png" alt="Letter">`;
    }

    // Check if player reaches the left side of the screen
    if (player.x <= 350) {
      goToNextLevel();
    }
  }
});

// Function to check collision
function isColliding(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}
