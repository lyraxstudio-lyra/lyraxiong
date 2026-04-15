let backgroundImg;
let ImgW = 200;
var particles = [];
var explosionProb = 0.99;
var explosionNum = 30;
let shape;
let shape2;
let shape3;
let snowflakes = [];
let cam;
let x = 100;
let y = 100;
let z = 600;
let bx;
let by;
let bz;
let tex;
let tex2;

let glitchFont;

let textLines = [
  "The Escape is right there.",
  "Don't follow the rule.",
  "Looking for an exit? Or hope.",
  "Turn back and stay with the flower.",
  "This place does not want to end."
];

let currentText = 0;
let textPanel;
let wasBoundaryText = false;

function preload() {
  shape = loadModel("Poeney2.obj", true);
  backgroundImg = loadImage("OldDrawing.jpg");
  glitchFont = loadFont("RubikGlitch-Regular.ttf");
  shape2 = loadModel("chains.obj", true);
  shape3 = loadModel("tree.obj", true);
  tex = loadImage("rust.jpg");
  tex2 = loadImage("wood.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  cam = createCamera();
  cam.setPosition(x, y, z);
  cam.lookAt(0, 0, 0);
  angleMode(DEGREES);

  textFont(glitchFont);
  textAlign(CENTER, CENTER);

  textPanel = createGraphics(500, 220);
  textPanel.textAlign(CENTER, CENTER);
  textPanel.textFont(glitchFont);
  textPanel.rectMode(CENTER);
}

function draw() {
  background(0);

  push();
  translate(0, 0, -100);
  image(backgroundImg, -1000, -700);
  pop();

  lights();

  if (random(1) > explosionProb) {
    for (let i = 0; i < explosionNum; i++) {
      var p = new Particles();
      particles.push(p);
    }
  }

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].show();
  }

  orbitControl();

  let moveSpeed = 10;

  let eye = createVector(cam.eyeX, cam.eyeY, cam.eyeZ);
  let center = createVector(cam.centerX, cam.centerY, cam.centerZ);
  let up = createVector(cam.upX, cam.upY, cam.upZ);

  let forward = p5.Vector.sub(center, eye).normalize();
  let right = forward.copy().cross(up).normalize();

  if (keyIsDown(87) || keyIsDown(119)) {
    eye.add(p5.Vector.mult(forward, moveSpeed));
    center.add(p5.Vector.mult(forward, moveSpeed));
  }

  if (keyIsDown(83) || keyIsDown(115)) {
    eye.sub(p5.Vector.mult(forward, moveSpeed));
    center.sub(p5.Vector.mult(forward, moveSpeed));
  }

  if (keyIsDown(65) || keyIsDown(97)) {
    eye.sub(p5.Vector.mult(right, moveSpeed));
    center.sub(p5.Vector.mult(right, moveSpeed));
  }

  if (keyIsDown(68) || keyIsDown(100)) {
    eye.add(p5.Vector.mult(right, moveSpeed));
    center.add(p5.Vector.mult(right, moveSpeed));
  }

  if (keyIsDown(81) || keyIsDown(113)) {
    eye.y -= moveSpeed;
    center.y -= moveSpeed;
  }

  if (keyIsDown(69) || keyIsDown(101)) {
    eye.y += moveSpeed;
    center.y += moveSpeed;
  }

  cam.setPosition(eye.x, eye.y, eye.z);
  cam.lookAt(center.x, center.y, center.z);

  x = eye.x;
  y = eye.y;
  z = eye.z;

  push();
  translate(0, 0, 90);
  let axis2 = [0, 0, 1];
  let axis1 = [1, 0, 0];
  rotate(180, axis2);
  rotate(40, axis1);
  noStroke();
  scale(2);
  ambientMaterial(238, 75, 43);
  emissiveMaterial(238, 75, 43);
  translate(-40, 0, 0);
  stroke(0);
  model(shape);
  pop();

  push();
  scale(60);
  translate(0, 0, -50);
  texture(tex);
  model(shape2);
  noStroke();
  pop();

  push();
  scale(60);
  translate(0, -50, 80);
  let axis5 = [0, 0, 1];
  rotate(180, axis5);
  texture(tex2);
  model(shape3);
  noStroke();
  pop();

  if (particles.length >= 100) {
    particles = [];
  }

  push();
  translate(-2000, 0, 1000);
  let axis3 = [0, 1, 0];
  rotate(30, axis3);
  for (let j = 0; j < 20; j++) {
    bx = j * 30;
    translate(bx, 0, 0);
    bar(bx, 0, 200);
  }
  pop();

  push();
  let axis4 = [0, 1, 0];
  rotate(30, axis4);

  for (let l = 0; l < 20; l++) {
    bz = l * 30;
    bar(-300, 0, bz);
  }

  for (let m = 0; m < 20; m++) {
    bx = m * 40;
    bar(bx, 0, -1500);
  }

  pop();

  updateBoundaryText();
  textAppear();
  teleport();
  //console.log(x, y, z);
}

class Particles {
  constructor() {
    this.pos = createVector(0, 0, 0);
    this.vel = p5.Vector.random3D().normalize().mult(random(4, 6));
  }

  update() {
    this.pos.add(this.vel);
  }

  show() {
    push();
    stroke(250);
    translate(this.pos.x, this.pos.y, this.pos.z);

    stroke(255, 237, 41);
    fill(255, 237, 41, 100);
    sphere(10);

    noStroke();
    translate(60, 20, 20);
    fill(238, 75, 43, 50);
    sphere(40);

    pop();
  }
}

function updateBoundaryText() {
  let showBoundaryText =
    x < -2000 || x > 1800 ||
    y < -2000 || y > 1800 ||
    z < -2200 || z > 2000;

  if (showBoundaryText && !wasBoundaryText) {
    let nextText = floor(random(textLines.length));

    while (nextText === currentText && textLines.length > 1) {
      nextText = floor(random(textLines.length));
    }

    currentText = nextText;
  }

  wasBoundaryText = showBoundaryText;
}

function textAppear() {
  let showBoundaryText =
    x < -2000 || x > 1800 ||
    y < -2000 || y > 1800 ||
    z < -2200 || z > 2000;

  let showStubbornText =
    (x > 3500 && x < 4500) ||
    (x < -3000 && x > -4000) ||
    (y > 3000 && y < 4000) ||
    (y < -4000 && y > -4000) ||
    (z > 3500 && z < 4500) ||
    (z < -4000 && z > -4500);

  if (showBoundaryText || showStubbornText) {
    let msg;

    if (showStubbornText) {
      msg = "you are way too stubborn...";
    } else {
      msg = textLines[currentText];
    }

    textPanel.clear();

    textPanel.push();
    textPanel.background(0, 180);
    textPanel.noStroke();
    textPanel.fill(255);
    textPanel.textFont(glitchFont);
    textPanel.textSize(26);
    textPanel.textAlign(CENTER, CENTER);
    textPanel.textWrap(WORD);

    let boxW = textPanel.width - 80;
    let boxH = textPanel.height - 40;
    textPanel.text(msg, textPanel.width / 2, textPanel.height / 2, boxW, boxH);
    textPanel.pop();

    let eye = createVector(cam.eyeX, cam.eyeY, cam.eyeZ);
    let center = createVector(cam.centerX, cam.centerY, cam.centerZ);
    let up = createVector(cam.upX, cam.upY, cam.upZ);

    let forward = p5.Vector.sub(center, eye).normalize();
    let right = forward.copy().cross(up).normalize();

    let panelDist = 180;
    let panelOffsetY = -40;

    let panelPos = p5.Vector.add(eye, p5.Vector.mult(forward, panelDist));
    panelPos.add(p5.Vector.mult(up, panelOffsetY));

    let yaw = atan2(forward.x, forward.z);
    let pitch = -asin(forward.y);

    push();
    translate(panelPos.x, panelPos.y, panelPos.z);
    rotateY(yaw + 180);
    rotateX(pitch);
    noStroke();
    texture(textPanel);
    plane(320, 140);
    pop();
  }
}

function mousePressed() {
  if (mouseButton === RIGHT) {
    x = 100;
    y = 100;
    z = 600;
    cam.setPosition(x, y, z);
    cam.lookAt(0, 0, 0);
    particles = [];
    return false;
  }
}

function bar(bx, by, bz) {
  translate(bx, by, bz);
  fill(238, 75, 43);
  cylinder(20, 30000);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function teleport() {
  if (
    x >= 4500 || x <= -4000 ||
    y >= 4000 || y <= -4000 ||
    z >= 4500 || z <= -5000
  ) {
    x = 100;
    y = 100;
    z = 600;
    cam.setPosition(x, y, z);
    cam.lookAt(0, 0, 0);
    particles = [];
  }
}