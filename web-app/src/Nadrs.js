import SVG from './SVG';
import * as cola from 'webcola';

export default class Nadrs {

  constructor(opts) {

    this.models = {
      'module': {selector: 'defs>.nadrs_cont', collider: 'Rectangle'},
      'hub': {selector: 'defs>.nhub_cont', collider: 'Ellipse'},
    }

    let defaults = {
      // cont: undefined,
      id: undefined,
      type: 'module', //svg base model
      nodes: new Map(), //list of all nodes
      connections: new Map(), //list of all connections

      elem: undefined, //SVG.js element
      dom: undefined, //element.node,

      width: 250,
      height: 150,
      x: SVG.viewbox().width * Math.random(),
      y: SVG.viewbox().height * Math.random(),

      props: {},
      oldProps: {},
      
    }

    console.log(cola);


    this.disabledSelector = '.disabled_value';

    Object.assign(this, defaults, opts);

    

    // this.bounds = {
    //   'module': 'defs>.nadrs_cont',
    //   'hub': 'defs>.nhub_cont',
    // }

    // console.log(SVG);

    this.create();

  }

  calcBounds(type) {

    let e = this.elem;
    let x = e.attr('x');
    let y = e.attr('y');
    let w = e.attr('width');
    let h = e.attr('height');

    this.bounds = new cola.Rectangle(x, x + w, y, y + h);

    return this.bounds;
  }

  create() {

    this.nodes.set(this.id, this);

    let model = SVG.findOne(this.models[this.type].selector);

    this.elem = model.clone();

    this.dom = this.elem.node;

    this.elem.move(this.x, this.y);
    this.elem.width(this.width);
    this.elem.height(this.height);
    this.elem.translate(-this.width/2, -this.height/2);
    // this.elem.translate('transform', 'matrix(1 0 0 -1 W/2 H/2)');

    SVG.put(this.elem);

    this.addDraggable();

    this.updateProperties();
    this.updateConnection();
    this.updateType();

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

  //dynamic callable methods from this.update()

  'updateType'() {

    const selector = '.type';
    const disSelector = this.disabledSelector.replace('.', '');

    const allNodes = this.dom.querySelectorAll(selector);
    const typeDoms = this.dom.querySelectorAll(`${selector}`);

    for (const typeDom of typeDoms) {
      typeDom.classList.add(disSelector);
    }

    const enabledSelectorsList = {
      '0': [], // none
      '1': ['.nadrs_output', '.nadrs_output_val'], // input
      '2': ['.nadrs_input', '.nadrs_input_val'], // output
      '3': ['.nadrs_input', '.nadrs_input_val', '.nadrs_output', '.nadrs_output_val'] // input/output
    }

    const enabledSelectors = enabledSelectorsList[this.props.type];

    for (const enabledSelector of enabledSelectors) {
      let currDom = this.dom.querySelector(enabledSelector);
      currDom.classList.remove(disSelector);
    }

  }

  'updateConnection'() {

    let id = this.props.connectionId;

    let node = this.nodes.get(id);

    if(!node) {
      // console.log(id + ' does not exist');
      return;
    }

    let {connection} = this.getConnectionTo(id);

    if(connection) {
      this.removeConnections();
      // this.connections.set(this.nameConnectionTo(id), connection);
    }

    this.createConnection(id);

  }

  removeConnections() {

    for(const [connectionName, connection] of this.connections.entries()) {

      if(connectionName.includes(this.id)) {

        let connection = this.connections.get(connectionName);

        this.deleteConnection(connection);
        this.connections.delete(connectionName);

      }
    }
  }

  deleteConnection(connection) {
    connection.path.remove();
  }

  nameConnectionTo(id) {
    return `${id} - ${this.id}`;
  }

  createConnection(id) {

    if(!this.nodes.has(id))
      return;

    let connection = this.createConnectionObjTo(id);
    let connectionName = this.nameConnectionTo(id);
    let node = this.nodes.get(id);
    
    this.connections.set(connectionName, connection);

    console.log(`Connection created: "${this.id}" - "${id}"`);
  }

  createConnectionObjTo(id) {

    let springs = {};
    let path = SVG.findOne('defs>.nadrs_connection').clone();

    SVG.put(path);

    let elems = {};
    elems[id] = this.nodes.get(id);
    elems[this.id] = this;

    let connection = {
      gravity: 200,
      springs: {},
      path,
      elems
    }

    this.setSpringTo(connection);
    elems[id].setSpringTo(connection);

    return connection;

  }

  setSpringTo(connection) {

    connection.springs[this.id] = new Springy({
      gravity: connection.gravity,
    });

  }

  update(key) {

    let format = {
      'connectionId': 'updateConnection',
      'type': 'updateType',
      'message': 'updateMessage',
    }

    let method = format[key];

    if(method in this) {
      this[method]();
    }

  }

  updateMessage() {

    console.log('value updated');

    let id = this.props.connectionId;
    let node = this.nodes.get(id);

    console.log('hey', id);

    if(!node)
      return;

    node.setProperty('input', this.props.message);

  }

  updateProperties(newProps = this.props) {

    for (let key in newProps) {

      let newValue = newProps[key];
      this.setProperty(key, newValue);
      // console.log(newProps, key);
      // Object.assign(this.props[key], newValue);

    }

  }

  setProperty(key, value = '') {

    this.oldProps[key] = this.props[key];
    this.props[key] = value;

    let maps = {
      "name": {selector: ".nadrs_name", ignored: []},
      "address": {selector: ".nadrs_itwoc", ignored: []},
      "message": {selector: ".nadrs_output_val", ignored: ["none"]},
      "input": {selector: ".nadrs_input_val", ignored: ["none"]},
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

    let dragObj = this.elem.draggable();

    dragObj.on('mousedown', (e) => {
      //move on top
      SVG.put(this.elem);
    });

    dragObj.on('dragmove', (e) => {

      document.body.dispatchEvent(new CustomEvent('nodedragmove', { bubbles: true, detail: {} }));
      // this.updateConnection();
      // this.relativeDragend(e);
    });

    dragObj.on('dragend', (e) => {

      document.body.dispatchEvent(new CustomEvent('nodedragend', { bubbles: true, detail: {} }));
      // this.updateConnection();
      // this.relativeDragend(e);
    });

  }

  selfDestruct() {

    this.elem.remove();
    this.removeConnections();
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

class Springy {

  constructor(options) {

    let defaults = {

      pos: {x: 0, y: 0},
      strength: {x: 0.1, y: 0.2},
      drag: {x: 0.8, y: 0.8},
      vel: {x: 0, y: 0},
      gravity: 10,

    }

    Object.assign(this, defaults, options);

    // this.pos.y += this.gravity;

  }

  update(target) {

   // target = mouseX;
   let force = {};

   force.x = target.x - this.pos.x;
   force.y = target.y  + this.gravity - this.pos.y;

   force.x *= this.strength.x;
   force.y *= this.strength.y;

   this.vel.x *= this.drag.x;
   this.vel.y *= this.drag.y;
   
   this.vel.x += force.x;
   this.vel.y += force.y;

   this.pos.x += this.vel.x;
   this.pos.y += this.vel.y;

 }

}