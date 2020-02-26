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

  updateNode(id,  value) {

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

let id, props;

id = '#1';
props = {
  address:"0x8",
  connection: {hub_name:"HUB poop", id: '8', path:"#2"},
  message:"none",
  name:"hello",
  type:"0"
};

VIZ.addNode({id: id, props: props});

id = '#2';
props = {
  address:"0x10",
  connection: {hub_name:"HUB hey", id: '10', path:'#1'},
  message:"none",
  name:"fuck",
  type:"1"
};

VIZ.addNode({id: id, props: props });

VIZ.removeNode({id: id});

export { VIZ };
