import SVG from './SVG'

console.log(SVG)

export default class Nadrs {

  constructor(opts) {

    let defaults = {
      cont: undefined,
      id: undefined,
      type: 'module', //svg base model
      nodes: new Map(), //list of all nodes

      elem: undefined, //SVG.js element
      dom: undefined, //element.node

      props: {},
      connections: new Map(),
    }

    Object.assign(this, defaults, opts);

    // console.log(SVG);

    this.create();

  }

  create() {

    let models = {
      'module': 'defs>.nadrs_cont',
    }

    let model = SVG.findOne(models[this.type]);

    this.elem = model.clone();
    this.dom = this.elem.node;

    this.elem.move((Math.random()*100) + '%', (Math.random()*100) + '%');
    SVG.put(this.elem);

    this.addDraggable();
    this.updateProperties();

    this.initConnection();

  }

  initConnection() {

    let ignoredVals = ['none'];
    let id = this.props.connection.path;

    if(ignoredVals.indexOf(id) !== -1)
      return;

    this.addConnection(id);
  }

  addConnection(id) {

    console.log(id);

    let node = this.nodes.get(id);

    if(!node) {
      // console.log(id + ' does not exist');
      return;
    }

    let connection = node.connections.get(this.id);

    if(connection) {

      console.log(`Connection added: "${id}" - "${this.id}"`);
      this.connections.set(id, connection);

      return;
    }

    this.createConnection(id);
  }

  removeConnection() {

    for(const [id, connection] of this.connections.entries()) {

      let node = this.nodes.get(id);
      node.delete(this.id);
      this.connections.delete(id);
    }
    //this.connections.delete(id);

  }

  createConnection(id) {

    let connection = this.createConnectionObj(this.id, id);
    let node = this.nodes.get(id);
    
    node.connections.set(this.id, connection);
    this.connections.set(id, connection);

    console.log(`Connection created: "${id}" - "${this.id}"`);
  }

  createConnectionObj(id1, id2) {
    let connection = {path: undefined, nodesId: [id1, id2]};
    return connection;
  }

  updateProperties() {

    for (let key in this.props) {

      let value = this.props[key];

      this.setProperty(key, value);

    }

  }

  setProperty(key, value = '') {

    let maps = {
      "name": {selector: ".nadrs_name", ignored: []},
      "address": {selector: ".nadrs_itwoc", ignored: []},
      "message": {selector: ".nadrs_input_val", ignored: ["none"]},
    }

    if(!(key in maps))
      return;

    let map = maps[key];

    if(map.ignored.indexOf(value) !== -1)
      return;

    let dom = this.dom.querySelector(map.selector);

    if(!dom)
      return;

    dom.textContent = value;
  }

  addDraggable() {

    this.elem.draggable().on('mousedown', (e) => {
      //move on top
      SVG.put(this.elem);
    });

    this.elem.draggable().on('dragend', (e) => {

      this.relativeDragend(e);

    }); 
  }

  selfDestruct() {
    this.elem.remove();
    this.removeConnection();
    this.nodes.delete(this.id);
  }

  relativeDragend(e) {

    let elem = this.elem;
    let viewBox = SVG.viewbox();
    let boundingRect = SVG.node.getBoundingClientRect();

    let abs = {
      x: elem.attr('x'),
      y: elem.attr('y'),
      width: viewBox.width || boundingRect.width, //fallback value if viewBox gives "0 0 0 0"
      height: viewBox.height || boundingRect.height,
    };

    let rel = {
      x: abs.x/abs.width * 100,
      y: abs.y/abs.height * 100,
    };

    elem.move(rel.x + '%', rel.y + '%');

  }
}