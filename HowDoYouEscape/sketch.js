let backgroundImg;
let ImgW=200;
var particles = [];
var explosionProb = 0.99;
var explosionNum = 30;
let shape;
let snowflakes = [];
let cam;
let x=100;
let y=100;
let z=600;
let bx;
let by;
let bz;
//let bz=1200;


function preload() {
  shape = loadModel("Poeney2.obj", true);
  backgroundImg = loadImage("OldDrawing.jpg");
}
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  cam = createCamera();
   cam.lookAt(0, 0, 0);
   angleMode(DEGREES);
  //cam.setPosition(x, y, z);
}



function draw() {
  //background(48, 52, 52);
  background(0);
  text("W A S D to move");
      push();
    translate(0,0,-100);
    image(backgroundImg,-1000,-700);
    pop();
   lights();
    
  
  //push();
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
   //filter(BLUR, 5);
    //translate(x,-20,-100);
    orbitControl();


  push();
  translate(0,0,90);
  let axis2 = [0, 0, 1];
  let axis1 = [1, 0, 0];
  rotate(180, axis2);
  rotate(40, axis1);
  noStroke();
  scale(2);
  ambientMaterial(238,75,43);
  normalMaterial(238,75,43);
  //specularMaterial(238,75,43);

  emissiveMaterial(238,75,43);
  translate(-40,0,0);
  stroke(0);

  model(shape);
  pop();
  cam.setPosition(x, y, z);
  
  if (keyIsDown(65) || keyIsDown(97)) { // 'A' or 'a'
    x -= 10;
  }

  if (keyIsDown(68) || keyIsDown(100)) { // 'D' or 'd'
    x += 10;
  }

  if (keyIsDown(87) || keyIsDown(119)) { // 'W' or 'w'
    y -= 10;
  }

  if (keyIsDown(83) || keyIsDown(115)) { // 'S' or 's'
    y += 10;
  }
  
  if (keyIsDown(81) || keyIsDown(113)) { //'q' or 'Q'
  z -= 10;
}

if (keyIsDown(69) || keyIsDown(101)) { //'e' or 'E'
  z += 10;
}
  if (particles.length >= 100) {
   particles = [];
    //filter(BLUR, 5);
  }
  console.log(x, y, z);

  
//I have question here
//the loop for the bars to be at the z=1000; 
//so when people zoom out with q,e, they will see something like a fence;
 push(); 
translate(-2000,0,1000);
  let axis3 = [0, 1, 0];
  rotate(30, axis3);

  for (let j = 0; j < 20; j++){  
    bx=j*30;
    //translate(0,by,0);
    bar(bx,0,100);
  }
pop();
  //bar(0,0,1000);
  //bar(0,5,1000);
  //bar(0,10,1000);
  //bar(0,15,1000);
  //bar(0,20,1000);

}



class Particles {
  constructor() {
    this.pos = createVector(0, 0);
    this.vel = p5.Vector.random3D().normalize().mult(random(4,6));
  }
  
  update() {
    this.pos.add(this.vel);
  }
  
  show() {
    push();
    stroke(250);
    //fill(255);
    translate(this.pos.x, this.pos.y, this.pos.z);

    stroke(255,237,41);
    fill(255,237,41,100);
    sphere(10);
    noStroke();
    translate(60,20,20);
    fill(238,75,43,50);
    sphere(40);
    
    pop();
  }
}


function textAppear(){
  
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


function bar(bx,by,bz){
  translate(bx,by,bz);
  fill(238,75,43);
  cylinder(20,30000);

}


