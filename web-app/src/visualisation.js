import SVG from './SVG'
import * as cola from 'webcola';
import Nadrs from './Nadrs';

const VIZ = {
  nodes: new Map(),
  connections: new Map(),
  svgObj: {},

  setViewBox(x, y, width, height) {
    SVG.viewbox(x, y, width, height);

    console.log(cola);

  },

  removeOverlaps() {

    // var rs = new Array(rects.length);
    // var dims = [];
    // rects.forEach(function (r, i) {
    //   var x = r.attr('x'), y = r.attr('y'), w = r.attr('width'), h = r.attr('height');
    //   dims.push({ x: x, y: y, w: w, h: h });
    //   rs[i] = new cola.Rectangle(x, x + w, y, y + h);
    // });
    
    // cola.removeOverlaps(rs);

    // rects.forEach(function (r, i) {
    //   var t = rs[i];
    //   if (animate) {
    //     r.animate().move(t.x, t.y);
    //   } else {
    //     r.move(t.x, t.y);
    //   }
    // });

  },

  addNode(options) {

    const defaults = {
      id: '',
      nodes: this.nodes,
      connections: this.connections,
      type: 'module',
      props: {},
    }

    options = Object.assign(defaults, options);

    let newElem = new Nadrs(options);

  },

  updateNode(options) {

    const defaults = {
      id: '',
      props: {},
    }

    options = Object.assign(defaults, options);

    let node = this.nodes.get(options.id);

    if(!node)
      return;

    this.updateProperties(node, options.props);

    // node.update(options);
  },

  updateProperties(node, newProps) {

    let currProps = node.props;

    for (let key in newProps) {

      let currVal = currProps[key];
      let newVal = newProps[key];

      console.log(currVal, newVal, key);

      if(JSON.stringify(currVal) + '' !== JSON.stringify(newVal) + '') {

        console.log(`${currProps.name} (${node.id}) ${key} set to `, newVal);

        node.setProperty(key, newVal);
        node.update(key, {newVal});
      }
    }
  },

  removeNode(options) {

    const defaults = {
      id: '',
      props: {},
    }

    options = Object.assign(defaults, options);

    let node = this.nodes.get(options.id);

    if(!node)
      return;

    node.selfDestruct();

  }
}

export { VIZ };
