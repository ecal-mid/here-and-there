var pos,target,vel,ctx,r,drag,strength,dragSlider, strengthSlider;

function setup() {
  ctx = createCanvas(windowWidth, windowHeight);  
  // frameRate(5); // if you want to see it in slloowwmmoo
  noStroke();
  background(0,0,0); 
  
  r = 60; 
  pos = 0;
  target = 0;
  vel =0;
  
 drag = 0.75; 
 strength = 0.1; 
}

function draw() { //draw is called every frame
   background('rgba(0,0,0, 0.6)');  

  target = mouseX;
  
  var force = target - pos;
  force *= strength;
  
  vel *= drag;
  vel+= force;
  
  pos +=vel;
    
  //draw our circle 
  fill(214, 71, 150);
  ellipse(pos, 200, r);
 
}






function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}