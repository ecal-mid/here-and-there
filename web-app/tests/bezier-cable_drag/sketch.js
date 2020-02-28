let offsetAngle = Math.PI/2;
let len = 0.5;

let p1 = {
	x: 100,
	y: 100,
}

let p2 = {
	x: 800,
	y: 800,
}

function setup() {

  offsetAngle = 0.5;

  createCanvas(1000, 1000);
  pixelDensity(2);

}

function draw() {

  background(100);
  noFill();

  p2.x = mouseX;
  p2.y = mouseY;

  let dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
  let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  let relLen = dist*len;

  let a1 = toPolar(p1.x, p1.y, angle + Math.PI/2 + offsetAngle, relLen);
  let a2 = toPolar(p2.x, p2.y, angle + Math.PI/2 + Math.PI + offsetAngle, relLen);

  stroke(0, 0, 0);
  bezier(p1.x, p1.y, a1.x, a1.y, a2.x, a2.y, p2.x, p2.y);

  stroke(255, 102, 0);
  line(p1.x, p1.y, a1.x, a1.y);
  line(p2.x, p2.y, a2.x, a2.y);

}

function toPolar(ox, oy, angle, radius) {

	let x = ox + Math.sin(angle) * radius;
	let y = oy + Math.cos(angle) * radius;

	return {x, y};
}