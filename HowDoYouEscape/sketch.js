let backgroundImg;
let ImgW = 200;
var particles = [];
var explosionProb = 0.99;
var explosionNum = 30;
let shape;
let snowflakes = [];
let cam;
let x = 100;
let y = 100;
let z = 600;
let bx;
let by;
let bz;

let glitchFont;

let textLines = [
  "The gate is too far away.",
  "Don't follow their rule.",
  "Looking for an exit? Or hope.",
  "Turn back and stay with the flower.",
  "This place does not want to end."
];

let wasOut = false;
let currentText = 0;
let textPanel;

function preload() {
  shape = loadModel("Poeney2.obj", true);
  backgroundImg = loadImage("OldDrawing.jpg");
  glitchFont = loadFont("RubikGlitch-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  cam = createCamera();
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

  cam.setPosition(x, y, z);

  if (keyIsDown(65) || keyIsDown(97)) {
    x -= 10;
  }

  if (keyIsDown(68) || keyIsDown(100)) {
    x += 10;
  }

  if (keyIsDown(87) || keyIsDown(119)) {
    y -= 10;
  }

  if (keyIsDown(83) || keyIsDown(115)) {
    y += 10;
  }

  if (keyIsDown(81) || keyIsDown(113)) {
    z -= 10;
  }

  if (keyIsDown(69) || keyIsDown(101)) {
    z += 10;
  }

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

  let isOut = x < -1000 || x > 500 || y < -1000 || y > 500 || z > 1000;

  if (isOut && !wasOut) {
    currentText = floor(random(textLines.length));
  }
  wasOut = isOut;

  textAppear();
  teleport();
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

function textAppear() {
  let showBoundaryText =
    x < -1000 || x > 500 || y < -1000 || y > 500 || z > 1000;

  let showStubbornText =
    (z < -900 && z > -1600) ||
    (x < -1600 && x > -2100) ||
    (y < -1600 && y > -2100) ||
    (z > 800 && z < 1600) ||
    (x > 800 && x < 1600) ||
    (y > 800 && y < 1600);

  if (showBoundaryText || showStubbornText) {
    let msg;

    if (showStubbornText) {
      msg = "you are way too stubborn";
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

    push();
    translate(x, y, z - 150);
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
    x > 1600 ||
    y > 1600 ||
    z > 1600 ||
    z < -1600 ||
    x < -2100 ||
    y < -2100
  ) {
    x = 100;
    y = 100;
    z = 600;
    cam.setPosition(x, y, z);
    cam.lookAt(0, 0, 0);
    particles = [];
  }
}