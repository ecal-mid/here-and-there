import SVG from './SVG';
import Springy from './Springy';
import * as cola from 'webcola';

export default class Nadrs {

  constructor(opts) {

    this.models = {
      'module': {selector: 'defs>.nadrs_cont', collider: 'Rectangle', width: 250, height: 150},
      'hub': {selector: 'defs>.nhub_cont', collider: 'Ellipse', width: 400, height: 400},
    }

    let defaults = {
      // cont: undefined,
      id: undefined,
      type: 'module', //svg base model
      nodes: new Map(), //list of all nodes
      connections: new Map(), //list of all connections

      elem: undefined, //SVG.js element
      dom: undefined, //element.node,

      width: undefined,
      height: undefined,
      x: SVG.viewbox().width * Math.random(),
      y: SVG.viewbox().height * Math.random(),

      props: {},
      oldProps: {},
      
    }

    Object.assign(this, defaults, opts);

    this.width = this.models[this.type].width;
    this.height = this.models[this.type].height;

    this.nodes.set(this.id, this);

    let model = SVG.findOne(this.models[this.type].selector);

    this.elem = model.clone();

    this.dom = this.elem.node;

    this.elem.move(this.x, this.y);
    this.elem.width(this.width);
    this.elem.height(this.height);

    SVG.put(this.elem);

    this.addDraggable(); // draggable listeners
    this.updateProperties();

    this.updateConnection();
    this.update('connection');
    this.update('type');

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

  getConnectionTo(id) {

    let returnValue = {connectionName: '', connection: null};

    for(let [connectionName, connection] of this.connections.entries()) {

      if(connectionName.includes(id) && connectionName.includes(this.id)) {
        returnValue = {connectionName, connection};
        break;
      }
    }

    return returnValue;

  }

  update(key) {

    let format = {
      'connectionId': 'updateConnection',
      'type': 'updateType',
      'message': 'updateMessage',
    }

    let method = format[key];

    if(method in this && key in this.props) {
      this[method]();
    }

  }

  //dynamic callable methods from this.update()

  'updateType'() {

    const disSelector = '.disabled_value';
    const typeDoms = this.dom.querySelectorAll('.type');

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

    if(!this.props.connectionId)
      return;

    let id = this.props.connectionId.addressId;

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

  updateMessage() {

    if(!this.props.connectionId)
      return;

    let id = this.props.connectionId.addressId;
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
      "hubName": {selector: ".nhub_name", ignored: []},
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