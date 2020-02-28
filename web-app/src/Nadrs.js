import SVG from './SVG';
import * as cola from 'webcola';

export default class Nadrs {

  constructor(opts) {

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


    this.disabledSelector = '.disabled_value';

    Object.assign(this, defaults, opts);

    this.models = {
      'module': 'defs>.nadrs_cont',
      'hub': 'defs>.nhub_cont',
    }

    // console.log(SVG);

    this.create();

  }

  calcBounds() {

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

    let model = SVG.findOne(this.models[this.type]);

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

      this.updatePath(connection);

      // console.log(`Connection added: "${id}" - "${this.id}"`);
      // this.connections.set(this.nameConnectionTo(id), connection);

      return;
    }

    this.removeConnections();
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
    connection.elem.remove();
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

    this.updatePath(connection);

    console.log(`Connection created: "${this.id}" - "${id}"`);
  }

  createConnectionObjTo(id) {

    let points = new Map();

    let elem = SVG.findOne('defs>.nadrs_connection').clone();
    SVG.put(elem);


    let range = Math.PI/2;

    let connection = {
      points,
      elem,
      angle: Math.random()*range/2-range,
      len: 0.4 || Math.random()+0.1*0.5,
    }

    this.setPoint(connection, 0);
    this.nodes.get(id).setPoint(connection, Math.PI);

    return connection;
  }

  setPoint(attr, way) {
    let points = attr.points;
    points.set(this.id, {x: this.elem.attr('x'), y: this.elem.attr('y'), way});
  }

  polarCoords(pos, angle, len) {
    let x = pos[0] + Math.sin(angle)*len;
    let y = pos[1] + Math.cos(angle)*len;
    return [x,y];
  }

  updatePath(connection) {

    // let connection = this.connections.get(connectionName);
    let iter = connection.points.entries();
    let [id1, point1] = iter.next().value;
    let [id2, point2] = iter.next().value;

    this.nodes.get(id1).setPoint(connection, point1.way);
    this.nodes.get(id2).setPoint(connection, point2.way);

    iter = connection.points.entries();
    [id1, point1] = iter.next().value;
    [id2, point2] = iter.next().value;

    let a1, p1, a2, p2;

    a1 = [point1.x, point1.y];
    a2 = [point2.x, point2.y];



    let len = Math.hypot(a1[0] - a1[1], a2[0] - a2[1]) * connection.len;
    len = Math.min(len, 300);
    let angle = Math.atan2(a2[1] - a1[1], a2[0] - a1[0]);

    p1 = this.polarCoords(a1, angle + Math.PI/2 + point1.way + connection.angle, len);
    p2 = this.polarCoords(a2, angle + Math.PI/2 + point2.way + connection.angle, len);

    const coords = `M${a1.join(',')} C${p1.join(',')} ${p2.join(',')} ${a2.join(',')}`;

    connection.elem.attr('d', coords);

    let id = this.id === id1 ? id2 : id1;
    let {elem: otherElem} = this.nodes.get(id);

    connection.elem.after(otherElem);

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

    let dragShit = this.elem.draggable();


    dragShit.on('mousedown', (e) => {
      //move on top
      SVG.put(this.elem);
    });


    dragShit.on('dragmove', (e) => {

      document.body.dispatchEvent(new CustomEvent('nodedragmove', { bubbles: true, detail: {} }));
      // this.updateConnection();
      // this.relativeDragend(e);


    });

    dragShit.on('dragend', (e) => {

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