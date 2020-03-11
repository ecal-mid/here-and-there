import SVG from './SVG';
import Springy from './Springy';
import * as cola from 'webcola';
import UTILS from './utils';

export default class Device {

  constructor(opts) {

    let unset = null;

    let defaults = {
      // cont: undefined,
      type: 'module', //svg base model
      devices: new Map(), //list of all devices

      elem: unset, //SVG.js element
      dom: unset, //element.node,

      width: unset,
      height: unset,

      x: SVG.viewbox().width * Math.random(),
      y: SVG.viewbox().height * Math.random(),

      props: {},
      oldProps: {},

      uuid: UTILS.createUUID(),
    }

    Object.assign(this, defaults, opts);


    this.models = {
      'module': {selector: 'defs>.nadrs_cont', collider: 'Rectangle', width: 250, height: 150},
      'hub': {selector: 'defs>.nhub_cont', collider: 'Ellipse', width: 400, height: 400},
    }

    this.model = this.models[this.type];

    this.width = this.width || this.model.width;
    this.height = this.height || this.model.height;

    this.devices.set(this.uuid, this);

    let elem = this.elem = SVG.findOne(this.model.selector).clone();

    elem.move(this.x, this.y);
    elem.width(this.width);
    elem.height(this.height);

    SVG.put(this.elem);

    this.dom = elem.node;

    // ADD DRAGGABLE
    let dragO = this.elem.draggable();

    dragO.on('mousedown', (e) => {
      SVG.put(this.elem);
    });

    dragO.on('dragmove', (e) => {
      document.body.dispatchEvent(new CustomEvent('nodedragmove', { bubbles: true, detail: {} }));
    });

    dragO.on('dragend', (e) => {
      document.body.dispatchEvent(new CustomEvent('nodedragend', { bubbles: true, detail: {} }));
    });

    this.updateProperties();
    this.update('connection');
    this.update('type');

  }

  selfDestruct() {

    this.elem.remove();
    this.removeConnections();
    this.devices.delete(this.uuid);

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

  // UPDATE SECTION /////////

  update(key) {

    const format = {
      'connectionId': 'updateConnection',
      'type': 'updateType',
      'name': 'updateName',
      'message': 'updateMessage',
    }

    const method = format[key];

    if(method in this && key in this.props) {
      this[method]();
    }
  }

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

  'updateName'() {}

  'updateConnection'() {}

  'updateMessage'() {

    if(!this.props.connectionId)
      return;

    let id = this.props.connectionId.addressId;
    let node = this.devices.get(id);

    console.log('hey', id);

    if(!node)
      return;

    node.setProperty('input', this.props.message);

  }


  // PROPERTIES SECTION /////////

  updateProperties(newProps = this.props) {

    for (let key in newProps) {
      let newValue = newProps[key];
      this.setProperty(key, newValue);
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
}
