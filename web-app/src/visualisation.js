import SVG from './SVG'
import Nadrs from './Nadrs';

const VIZ = {
  nodes: new Map(),
  connections: new Map(),
  svgObj: {},

  connectNodes(id1, id2) {

  },

  addNode(options) {

    const defaults = {
      id: '',
      nodes: this.nodes,
      type: 'module',
      props: {},
    }

    options = Object.assign(defaults, options);

    console.log(options)

    let newElem = new Nadrs(options);

    this.nodes.set(options.id, newElem);

  },

  updateNode(id, value) {
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
