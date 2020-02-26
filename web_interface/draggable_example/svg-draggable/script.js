gsap.registerPlugin(Draggable, InertiaPlugin);

gsap.set("#circle", {transformOrigin:"50% 50%"})

Draggable.create("#box", {
  type:"x,y",
  bounds:"#container",
  overshootTolerance:0,
  inertia:true
})

Draggable.create("#circle", {
  type:"rotation",
  inertia:true
})