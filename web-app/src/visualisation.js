import SVG from './SVG'
import * as cola from 'webcola';
import Nadrs from './Nadrs';

const VIZ = {
  nodes: new Map(),
  connections: new Map(),
  svgObj: {},

  init(x, y, width, height) {

    //console.log('hey');

    window.addEventListener('nodedragmove', e => {
        // console.log('dragended');
        this.removeOverlaps();
        
    });

    SVG.viewbox(x, y, width, height);

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
        node.updateConnection();
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
