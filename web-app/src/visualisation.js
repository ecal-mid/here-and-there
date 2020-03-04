import SVG from './SVG'
import * as cola from 'webcola';
import Nadrs from './Nadrs';

const VIZ = {
  nodes: new Map(),
  connections: new Map(),
  svgObj: {},

  init(x, y, width, height) {

    window.addEventListener('nodedragmove', e => {
        // console.log('dragended');
        this.removeOverlaps();
        
      });

    window.addEventListener('nodedragend', e => {
        // console.log('dragended');
        this.removeOverlaps();
        
      });

    SVG.viewbox(x, y, width, height);
    SVG.panZoom();
    
    this.update();    
  },

  update() {

    for (let [connectionName, connection] of this.connections.entries()) {
      this.updateConnection(connection);
    }

    requestAnimationFrame(this.update.bind(this));
  },

  updateConnection(connection) {

    const [id1, id2] = Object.keys(connection.springs);

    const spring1 = connection.springs[id1];
    const spring2 = connection.springs[id2];

    const elem1 = connection.elems[id1].elem;
    const elem2 = connection.elems[id2].elem;

    const a1 = {
      x: elem1.attr('x') + elem1.attr('width') * 0.5,
      y: elem1.attr('y') + elem1.attr('height') * 0.5
    }

    const a2 = {
      x: elem2.attr('x') + elem2.attr('width') * 0.5,
      y: elem2.attr('y') + elem2.attr('height') * 0.5
    }

    spring1.update(a1);
    spring2.update(a2);

    const h1 = spring1.pos;
    const h2 = spring2.pos;

    const coords = `M${a1.x},${a1.y} C${h1.x},${h1.y} ${h2.x},${h2.y} ${a2.x},${a2.y}`;

    connection.path.attr('d', coords);
    connection.path.after(elem1);
  },

  removeOverlaps() {

    let nodes = this.nodes.entries();
    let bounds = [];
    let refs = [];

    for (let [id, node] of nodes) {

      let bound = node.calcBounds();

      refs.push(node);
      bounds.push(bound);

    }
    
    cola.removeOverlaps(bounds);

    for (let i = 0; i < bounds.length; i++) {

      let bound = bounds[i];
      let node = refs[i];

      node.elem.move(bound.x, bound.y);
    }

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