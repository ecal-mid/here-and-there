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
      connections: this.connections,
      type: 'module',
      props: {},
    }

    options = Object.assign(defaults, options);

    console.log(options)

    let newElem = new Nadrs(options);

    this.nodes.set(options.id, newElem);

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

      console.log(currVal, newVal);

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
