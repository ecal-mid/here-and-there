export default class Springy {

  constructor(options) {

    let defaults = {

      pos: {x: 0, y: 0},
      strength: {x: 0.1, y: 0.2},
      drag: {x: 0.8, y: 0.8},
      vel: {x: 0, y: 0},
      gravity: 10,

    }

    Object.assign(this, defaults, options);

    // this.pos.y += this.gravity;

  }

  update(target) {

   // target = mouseX;
   let force = {};

   force.x = target.x - this.pos.x;
   force.y = target.y  + this.gravity - this.pos.y;

   force.x *= this.strength.x;
   force.y *= this.strength.y;

   this.vel.x *= this.drag.x;
   this.vel.y *= this.drag.y;
   
   this.vel.x += force.x;
   this.vel.y += force.y;

   this.pos.x += this.vel.x;
   this.pos.y += this.vel.y;

 }
}