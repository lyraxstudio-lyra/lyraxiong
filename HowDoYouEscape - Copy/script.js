import * as THREE from "three";
import { PointerLockControls } from "./src/PointerLockControls.js";
import { OBJLoader } from "./src/OBJLoader.js";
import { FontLoader } from "./src/FontLoader.js";
import { TextGeometry } from "./src/TextGeometry.js";

let scene, camera, renderer, controls;
let clock = new THREE.Clock();

let backgroundMesh;
let shape;
let font;

let particles = [];
let explosionProb = 0.99;
let explosionNum = 30;

let textLines = [
  "The Escape is right there.",
  "Don't follow the rule.",
  "Looking for an exit? Or hope.",
  "Turn back and stay with the flower.",
  "This place does not want to end."
];

let currentText = 0;
let wasBoundaryText = false;

let messagePlane;
let messageCanvas, messageCtx, messageTexture;

let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

const startPosition = new THREE.Vector3(100, 100, 600);

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    50000
  );
  camera.position.copy(startPosition);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new PointerLockControls(camera, document.body);
  scene.add(controls.getObject());

  const blocker = document.createElement("div");
  blocker.style.position = "fixed";
  blocker.style.inset = "0";
  blocker.style.background = "rgba(0,0,0,0.6)";
  blocker.style.display = "flex";
  blocker.style.alignItems = "center";
  blocker.style.justifyContent = "center";
  blocker.style.color = "white";
  blocker.style.fontFamily = "sans-serif";
  blocker.style.fontSize = "24px";
  blocker.style.cursor = "pointer";
  blocker.style.zIndex = "10";
  blocker.innerHTML = "Click to enter";
  document.body.appendChild(blocker);

  blocker.addEventListener("click", function () {
    controls.lock();
  });

  controls.addEventListener("lock", function () {
    blocker.style.display = "none";
  });

  controls.addEventListener("unlock", function () {
    blocker.style.display = "flex";
  });

  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(500, 800, 500);
  scene.add(dirLight);

  const textureLoader = new THREE.TextureLoader();
  const objLoader = new OBJLoader();
  const fontLoader = new FontLoader();

  textureLoader.load("./OldDrawing.jpg", function (tex) {
    const bgGeo = new THREE.PlaneGeometry(2000, 1400);
    const bgMat = new THREE.MeshBasicMaterial({ map: tex });
    backgroundMesh = new THREE.Mesh(bgGeo, bgMat);
    backgroundMesh.position.set(0, 0, -100);
    scene.add(backgroundMesh);
  });

  objLoader.load("./Poeney2.obj", function (obj) {
    shape = obj;
    shape.traverse(function (child) {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xee4b2b,
          emissive: 0xee4b2b,
          emissiveIntensity: 0.5
        });
      }
    });

    shape.scale.set(2, 2, 2);
    shape.position.set(-40, 0, 90);
    shape.rotation.z = Math.PI;
    shape.rotation.x = THREE.MathUtils.degToRad(40);
    scene.add(shape);
  });

  fontLoader.load("./RubikGlitch-Regular.typeface.json", function (loadedFont) {
    font = loadedFont;
  });

  createBars();
  createMessagePanel();
  bindKeys();

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("contextmenu", (e) => e.preventDefault());
  window.addEventListener("mousedown", onMouseDown);
}

function createMessagePanel() {
  messageCanvas = document.createElement("canvas");
  messageCanvas.width = 500;
  messageCanvas.height = 220;
  messageCtx = messageCanvas.getContext("2d");

  messageTexture = new THREE.CanvasTexture(messageCanvas);

  const planeGeo = new THREE.PlaneGeometry(320, 140);
  const planeMat = new THREE.MeshBasicMaterial({
    map: messageTexture,
    transparent: true
  });

  messagePlane = new THREE.Mesh(planeGeo, planeMat);
  messagePlane.visible = false;
  scene.add(messagePlane);
}

function updateMessagePanel(msg) {
  messageCtx.clearRect(0, 0, messageCanvas.width, messageCanvas.height);

  messageCtx.fillStyle = "rgba(0,0,0,0.7)";
  messageCtx.fillRect(0, 0, messageCanvas.width, messageCanvas.height);

  messageCtx.fillStyle = "white";
  messageCtx.font = "26px sans-serif";
  messageCtx.textAlign = "center";
  messageCtx.textBaseline = "middle";

  wrapText(
    messageCtx,
    msg,
    messageCanvas.width / 2,
    messageCanvas.height / 2,
    messageCanvas.width - 80,
    34
  );

  messageTexture.needsUpdate = true;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let lines = [];
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, startY + i * lineHeight);
  }
}

function createBars() {
  const barMaterial = new THREE.MeshStandardMaterial({ color: 0xee4b2b });
  const barGeometry = new THREE.CylinderGeometry(20, 20, 30000, 16);

  const group1 = new THREE.Group();
  group1.position.set(-2000, 0, 1000);
  group1.rotation.y = THREE.MathUtils.degToRad(30);

  for (let j = 0; j < 20; j++) {
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.position.set(j * 30, 0, 0);
    group1.add(bar);
  }
  scene.add(group1);

  const group2 = new THREE.Group();
  group2.rotation.y = THREE.MathUtils.degToRad(30);

  for (let l = 0; l < 20; l++) {
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.position.set(-300, 0, l * 30);
    group2.add(bar);
  }

  for (let m = 0; m < 20; m++) {
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.position.set(m * 40, 0, -1500);
    group2.add(bar);
  }

  scene.add(group2);
}

function bindKeys() {
  document.addEventListener("keydown", function (event) {
    switch (event.code) {
      case "KeyW":
        moveForward = true;
        break;
      case "KeyS":
        moveBackward = true;
        break;
      case "KeyA":
        moveLeft = true;
        break;
      case "KeyD":
        moveRight = true;
        break;
      case "KeyQ":
        moveUp = true;
        break;
      case "KeyE":
        moveDown = true;
        break;
    }
  });

  document.addEventListener("keyup", function (event) {
    switch (event.code) {
      case "KeyW":
        moveForward = false;
        break;
      case "KeyS":
        moveBackward = false;
        break;
      case "KeyA":
        moveLeft = false;
        break;
      case "KeyD":
        moveRight = false;
        break;
      case "KeyQ":
        moveUp = false;
        break;
      case "KeyE":
        moveDown = false;
        break;
    }
  });
}

function onMouseDown(event) {
  if (event.button === 2) {
    resetPlayer();
  }
}

function resetPlayer() {
  controls.getObject().position.copy(startPosition);
  velocity.set(0, 0, 0);
  particles.forEach((p) => scene.remove(p.mesh));
  particles = [];
}

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);

  if (Math.random() > explosionProb) {
    for (let i = 0; i < explosionNum; i++) {
      createParticle();
    }
  }

  updateParticles();
  updateMovement(delta);
  updateBoundaryText();
  textAppear();
  teleport();

  renderer.render(scene, camera);
}

function updateMovement(delta) {
  if (!controls.isLocked) return;

  const speed = 700;

  direction.set(0, 0, 0);

  if (moveForward) direction.z -= 1;
  if (moveBackward) direction.z += 1;
  if (moveLeft) direction.x -= 1;
  if (moveRight) direction.x += 1;
  if (moveUp) direction.y += 1;
  if (moveDown) direction.y -= 1;

  direction.normalize();

  if (moveForward || moveBackward) {
    controls.moveForward(-direction.z * speed * delta);
  }

  if (moveLeft || moveRight) {
    controls.moveRight(direction.x * speed * delta);
  }

  controls.getObject().position.y += direction.y * speed * delta;
}

function createParticle() {
  const particleGroup = new THREE.Group();

  const sphere1 = new THREE.Mesh(
    new THREE.SphereGeometry(10, 12, 12),
    new THREE.MeshBasicMaterial({
      color: 0xffed29,
      transparent: true,
      opacity: 1
    })
  );
  particleGroup.add(sphere1);

  const sphere2 = new THREE.Mesh(
    new THREE.SphereGeometry(40, 12, 12),
    new THREE.MeshBasicMaterial({
      color: 0xee4b2b,
      transparent: true,
      opacity: 0.2
    })
  );
  sphere2.position.set(60, 20, 20);
  particleGroup.add(sphere2);

  particleGroup.position.set(0, 0, 0);

  scene.add(particleGroup);

  const dir = new THREE.Vector3(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  ).normalize().multiplyScalar(THREE.MathUtils.randFloat(4, 6));

  particles.push({
    mesh: particleGroup,
    vel: dir
  });

  if (particles.length >= 100) {
    const old = particles.shift();
    scene.remove(old.mesh);
  }
}

function updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    particles[i].mesh.position.add(particles[i].vel);
  }
}

function updateBoundaryText() {
  const pos = controls.getObject().position;

  const showBoundaryText =
    pos.x < -1000 || pos.x > 800 ||
    pos.y < -1000 || pos.y > 800 ||
    pos.z < -1200 || pos.z > 1000;

  if (showBoundaryText && !wasBoundaryText) {
    let nextText = Math.floor(Math.random() * textLines.length);

    while (nextText === currentText && textLines.length > 1) {
      nextText = Math.floor(Math.random() * textLines.length);
    }

    currentText = nextText;
  }

  wasBoundaryText = showBoundaryText;
}

function textAppear() {
  const pos = controls.getObject().position;

  const showBoundaryText =
    pos.x < -1000 || pos.x > 800 ||
    pos.y < -1000 || pos.y > 800 ||
    pos.z < -1200 || pos.z > 1000;

  const showStubbornText =
    (pos.x > 2500 && pos.x < 3500) ||
    (pos.x < -2000 && pos.x > -3000) ||
    (pos.y > 2000 && pos.y < 3000) ||
    (pos.y < -2000 && pos.y > -3000) ||
    (pos.z > 2500 && pos.z < 3500) ||
    (pos.z < -3000 && pos.z > -3500);

  if (showBoundaryText || showStubbornText) {
if (showBoundaryText || showStubbornText) {
  let msg = showStubbornText ? "you are way too stubborn..." : textLines[currentText];

  updateMessagePanel(msg);

  const camDir = new THREE.Vector3();
  camera.getWorldDirection(camDir);

  messagePlane.visible = true;
  messagePlane.position.copy(pos).add(camDir.multiplyScalar(150));
  messagePlane.quaternion.copy(camera.quaternion);
} else {
  messagePlane.visible = false;
}

    updateMessagePanel(msg);

    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);

    messagePlane.visible = true;
    messagePlane.position.copy(pos).add(camDir.multiplyScalar(150));
    messagePlane.quaternion.copy(camera.quaternion);
  } else {
    messagePlane.visible = false;
  }
}

function teleport() {
  const pos = controls.getObject().position;

  if (
    pos.x >= 3500 || pos.x <= -3000 ||
    pos.y >= 3000 || pos.y <= -3000 ||
    pos.z >= 3500 || pos.z <= -4000
  ) {
    resetPlayer();
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}