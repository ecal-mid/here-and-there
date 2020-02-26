var drag = ['.rect', '.group', '.svg'],
    constraint = {
      minX: 0,
      minY: 0,
      maxX: 1200,
      maxY: 250
    },
    constraintFn = function (x, y) {
      // have to get event.target width & height dynamically
      // issue when you move mouse fast outside the dragged element can remain static even if not yet to the limit
      return {
        x: x >= 0 && x <= 1150,
        y: y >= 0 && y <= 200
      }
    }

// insert dynamic rect
SVG.get('drawing')
  .rect(50, 50)
  .x(400)
  .y(20)
  .addClass('dynamic rect')

// insert dynamic group
var group = SVG.get('drawing')
  .group()
  .addClass('dynamic group')
  .transform({x: 470, y: 20})

group.rect(50, 50)
group.text("dynamic\ngroup")
  .x(25)
  .y(20)
  .font({
    anchor: 'middle',
    leading: 0.75
  })

// insert dynamic nested SVG
var nested = SVG.get('drawing')
  .nested()
  .x(540)
  .y(20)
  .addClass('dynamic svg')

nested.rect(50, 50)
nested.text("dynamic\nnested")
  .x(25)
  .y(20)
  .font({
    anchor: 'middle',
    leading: 0.75
  })

// start drag of all elements constrained into viewBox
for (var element in drag) {
  var elements = document.querySelectorAll(drag[element])

  for (var i = 0; i < elements.length; i++) {
    SVG.adopt(elements[i]).draggable(constraint)
  }
}