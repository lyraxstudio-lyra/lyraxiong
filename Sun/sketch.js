let bgImage;
let myFont;
let textY;
let img1;
let img2;
let img3;
let img4;
let img5;
let img6;
let img7;
let img8;
let img9;
let sunImage = [];
let cnv;

let haloX = [];
let haloY = [];
let haloAge = [];

// overlay controls
let overlayActive = false;
let overlayIndex = -1;
let haloTotal = 0;
let overlayAlpha = 0;
let overlayTargetAlpha = 0;

let sunSpots = [
  { x: 297, y: 348, r: 40 }, // Comb1
  { x: 280, y: 290, r: 40 }, // Comb2
  { x: 300, y: 260, r: 40 }, // Comb3
  { x: 270, y: 360, r: 40 }, // Comb4
  { x: 275, y: 310, r: 40 }, // Comb5
  { x: 240, y: 365, r: 40 }, // Comb6
  { x: 275, y: 275, r: 40 }, // Comb7
  { x: 280, y: 290, r: 40 }, // Comb8
  { x: 320, y: 290, r: 40 }  // Comb9
];

let dialo = [
  "I see, you are getting this fast",
  "Having fun? you know, you can always try again",
  "Isn't the sun amazing",
  "You like it too?",
  "I wonder how long is our sun going to last"
];

let textIndex = 0;


function preload() {
  bgImage = loadImage("assets/Bg.jpg");
  myFont = loadFont("assets/Sixtyfour.ttf");

  img1 = loadImage("assets/Comb1.png");
  img2 = loadImage("assets/Comb2.png");
  img3 = loadImage("assets/Comb3.png");
  img4 = loadImage("assets/Comb4.png");
  img5 = loadImage("assets/Comb5.png");
  img6 = loadImage("assets/Comb6.png");
  img7 = loadImage("assets/Comb7.png");
  img8 = loadImage("assets/Comb8.png");
  img9 = loadImage("assets/Comb9.png");

  sunImage = [img1, img2, img3, img4, img5, img6, img7, img8, img9];
}


function setup() {
  let cnv = createCanvas(600, 600);
  let holder = document.querySelector(".canvas-holder");
  cnv.parent(holder);
  noCursor();
  background(bgImage);
  textY = 120;


  document.querySelector(".btnA").addEventListener("click", drawImage);
  document.querySelector(".btnB").addEventListener("click", redoDrawing);   
  document.querySelector(".btnC").addEventListener("click", letTheNightComes); 
  document.querySelector(".btnSave").addEventListener("click", saveCanvasImage);
}


function draw() {


  textFont(myFont);
  textSize(20);
  text("Sun, ", 50, 100);
  textSize(10);

  for (let i = 0; i < 40; i++) {
    textY += 10;
    text("source of all our energy.", 50, textY);
  }
  textY = 120;



// --- HALO CREATION WHEN NO OVERLAY ---
  if (!overlayActive) {

    if (mouseX > 0 && mouseX < 600 && mouseY > 0 && mouseY < 600) {
      haloX.push(mouseX);
      haloY.push(mouseY);
      haloAge.push(0);
      haloTotal++;
    }

    if (haloX.length > 50) {
      haloX.shift();
      haloY.shift();
      haloAge.shift();
    }
  }



// --- DRAW HALOS ---
  push();
  drawingContext.shadowBlur = 80;
  noStroke();

  for (let j = 0; j < haloX.length; j++) {

    if (!overlayActive) {
      haloAge[j]++;
    }

    let fade = map(haloAge[j], 30, 60, 200, 0);

    if (haloAge[j] < 30) {
      fill(255, 240, 200, 200);
      drawingContext.shadowColor = "rgba(255,240,200,0.8)";
    } else {
      fill(227, 166, 68, fade);
      drawingContext.shadowColor = "rgba(227, 166, 68,0.8)";
    }

    ellipse(haloX[j], haloY[j], 30);

    if (!overlayActive && haloAge[j] > 60) {
      haloX.splice(j, 1);
      haloY.splice(j, 1);
      haloAge.splice(j, 1);
      j--;
    }
  }

  pop();



  // --- DRAW OVERLAY IMAGE + CURSOR HALO (only when active) ---
  if (overlayActive && overlayIndex >= 0) {

    // ease alpha toward target
    overlayAlpha = lerp(overlayAlpha, overlayTargetAlpha, 0.05);

    push();
    tint(255, overlayAlpha);
    image(sunImage[overlayIndex], 0, 0, width, height);
    pop();

    // cursor halo on top of image
    push();
    drawingContext.shadowBlur = 40;
    drawingContext.shadowColor = "rgba(255,240,200,0.9)";
    noStroke();
    fill(255, 240, 200, 220);
    ellipse(mouseX, mouseY, 30);
    pop();
  }
}



function mousePressed() {
  
   if (!overlayActive) {
    let insideCanvas =
      mouseX >= 0 &&
      mouseX <= width &&
      mouseY >= 0 &&
      mouseY <= height;

    if (insideCanvas) {
      drawImage();   
      return;
    }
  }

  // choose random text every click
  textIndex = int(random(dialo.length));

  if (overlayActive && overlayIndex >= 0) {

    let spot = sunSpots[overlayIndex];
    let d = dist(mouseX, mouseY, spot.x, spot.y);

    if (d < spot.r) {

// reset halos & overlay
      haloX = [];
      haloY = [];
      haloAge = [];
      haloTotal = 0;

      overlayActive = false;
      overlayIndex = -1;
      overlayAlpha = 0;
      overlayTargetAlpha = 0;
      
// clear to background and show my dialogue
      background(bgImage);

      push();
      fill(255);
      textSize(11);
      text(dialo[textIndex], 50, 50);
      pop();
    }
  }
}



function drawImage() {
  if (!overlayActive) {
    overlayActive = true;
    overlayIndex = int(random(sunImage.length));
    overlayAlpha = 0;
    overlayTargetAlpha = 255; // fade in
  }
}



function redoDrawing() {
  background(bgImage);
  haloX = [];
  haloY = [];
  haloAge = [];
  haloTotal = 0;
  overlayActive = false;
  overlayIndex = -1;
  overlayAlpha = 0;
  overlayTargetAlpha = 0;
}



function letTheNightComes() {
  background(0);
  haloX = [];
  haloY = [];
  haloAge = [];
  haloTotal = 0;
  overlayActive = false;
  overlayIndex = -1;
  overlayAlpha = 0;
  overlayTargetAlpha = 0;
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas(cnv, "SunHalo", "png");
  }
}


function saveCanvasImage() {
// saves the current canvas as PNG
  saveCanvas("theSun", "png");
}

