import SVG from './SVG'

export default class Nadrs {

  constructor(opts) {

    let defaults = {
      cont: undefined,
      id: undefined,
      type: 'module', //svg base model
      nodes: new Map(), //list of all nodes
      connections: new Map(), //list of all connections

      elem: undefined, //SVG.js element
      dom: undefined, //element.node

      props: {},
      oldProps: {},
      
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

    this.updateConnection();

  }

  getConnectionTo(id) {

    let result = {connectionName: '', connection: null};

    for(let [connectionName, connection] of this.connections.entries()) {

      // console.log(connectionName, connection);

      if(connectionName.includes(id) && connectionName.includes(this.id)) {
        result = {connectionName, connection};
        break;
      }
    }

    return result;

  }

  updateConnection() {

    let id = this.props.connectionId;

    let node = this.nodes.get(id);

    if(!node) {
      // console.log(id + ' does not exist');
      return;
    }

    let {connection} = this.getConnectionTo(id);

    if(connection) {

      // console.log(`Connection added: "${id}" - "${this.id}"`);
      // this.connections.set(this.nameConnectionTo(id), connection);

      return;
    }

    this.createConnection(id);
  }

  removeConnection() {

    for(const [connectionName, connection] of this.connections.entries()) {

      if(connectionName.includes(this.id)) {
        this.connections.delete(connectionName);
      }
    }

  }

  nameConnectionTo(id) {
    return `${id} - ${this.id}`;
  }

  createConnection(id) {

    let connection = this.createConnectionObj(this.id, id);
    let connectionName = this.nameConnectionTo(id);
    let node = this.nodes.get(id);
    
    this.connections.set(connectionName, connection);

    console.log(`Connection created: "${this.id}" - "${id}"`);
  }

  createConnectionObj(id1, id2) {
    let connection = {path: undefined, nodesId: [id1, id2]};
    return connection;
  }

  update(key) {

    let format = {
      'connectionId': 'updateConnection', 
    }

    let method = format[key];

    if(method in this) {
      this[method]();
    }
  }

  updateProperties(newProps = this.props) {

    for (let key in newProps) {

      let newValue = newProps[key];

      // console.log(newProps, key);

      this.setProperty(key, newValue);

      // Object.assign(this.props[key], newValue);

    }

  }

  setProperty(key, value = '') {

    this.oldProps[key] = this.props[key];
    this.props[key] = value;

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