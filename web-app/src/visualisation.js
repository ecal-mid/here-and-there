import SVG from './SVG'
import * as cola from 'webcola';
import UTILS from './utils'

const VIZ = {
  devices: new Map(),

  models: {
    'device': {selector: 'defs>.nadrs_cont', width: 250, height: 150},
    'hub': {selector: 'defs>.nhub_cont', width: 400, height: 400},
  },

  propertyMaps: {
    "name": {selector: ".n_name", ignored: []},
    "address": {selector: ".nadrs_itwoc", ignored: []},
    "message": {selector: ".nadrs_output_val", ignored: ["none"]},
    "input": {selector: ".nadrs_input_val", ignored: ["none"]},
  },

  hubDatabase: {},

  init(x, y, width, height) {

    SVG.viewbox(x, y, width, height);
    SVG.panZoom();
    
    requestAnimationFrame(this.update.bind(this));
  },

  updateHubDatabase(hubDatabase) {
    this.hubDatabase = hubDatabase;
  },

  addDevice(options) {

    const device = {

      pathName: '',

      uuid: UTILS.createUUID(),

      props: {},
      _props: {}, //old properties
      
      type: 'device',

      elem: undefined,
      dom: undefined,
      
      connections: new Map(), //fill with uuid,

      position: {
        x: SVG.viewbox().width * Math.random(),
        y: SVG.viewbox().height * Math.random()
      },
    };

    Object.assign(device, options);

    device.elem = this.setElem(device);
    device.dom = this.setDom(device);

    this.updateProperties(device, device.props);
    this.setDraggable(device);
    this.setConnections(device);

    this.devices.set(device.uuid, device);
  },

  setConnections(device) {
    let props = device.props;

    // console.log(connection);
  },

  setTextContent(device, propKey, newValue = '') {

    if(!(propKey in this.propertyMaps)) {
      return;
    }

    const map = this.propertyMaps[propKey];

    // skip if ignored newValue
    if(map.ignored.indexOf(newValue) !== -1) {
      return;
    }

    const dom = device.dom.querySelector(map.selector);

    if(!dom) {
      console.log('No dom assigned! on the device', device.pathName);
      return;
    }

    dom.textContent = newValue;

  },

  setElem(device) {

    const {position, type} = device;
    const model = this.models[type];
    const elem = SVG.findOne(model.selector).clone();

    elem.move(position.x, position.y);
    elem.width(model.width);
    elem.height(model.height);

    SVG.put(elem);

    return elem;
  },

  setDom(device) {
    return device.elem.node;
  },

  setDraggable(device) {

    let dragObj = device.elem.draggable();

    dragObj.on('mousedown', this.onmousedown.bind(this, device));
    dragObj.on('dragmove', this.ondragmove.bind(this, device));
    dragObj.on('dragend', this.ondragend.bind(this, device));

    return dragObj
  },

  onmousedown(device, event) {
    // move elem on top layer
    SVG.put(device.elem);
  },

  ondragmove(device, event) {
    this.removeOverlaps();
  },
  ondragend(device, event) {
    this.removeOverlaps();
  },

  setupConnections() {

  },

  updateDevice(opts, newProps) {
    const device = this.getDeviceByPath(opts.pathName);

    if(!device)
      return;

    this.updateProperties(device, newProps);
    
  },

  updateProperties(device, newProps) {

    //make sure we get all single keys
    let allPropKeys = new Set([...Object.keys(device.props), ...Object.keys(newProps)]);

    for (let propKey of allPropKeys) {

      let newPropValue = newProps[propKey];
      this.updateProperty(device, propKey, newPropValue);

    }
  },

  updateProperty(device, propKey, newPropValue) {
    let propValue = device.props[propKey];

    if(UTILS.areSameSimpleObj(newPropValue, propValue))
      return;

    this.updateProps(device, propKey, newPropValue);
    this.setTextContent(device, propKey, newPropValue);
    this.callSpecialEvent(device, propKey);

  },

  updateProps(device, propKey, propValue) {
    device._props[propKey] = device.props[propKey];
    device.props[propKey] = propValue;
  },

  updateMaps: {
    'connectionId': 'updateConnection',
    'type': 'updateType',
    'name': 'updateName',
    'message': 'updateMessage',
  },

  callSpecialEvent(device, key) {

    const method = this.updateMaps[key];

    if(!(method in this))
      return;

    if(!(key in device.props))
      return;

    this[method].call(this, device, key);
  },

  'updateType'(device) {

    const disSelector = 'disabled_value';
    const typeDoms = device.dom.querySelectorAll('.type');

    for (const typeDom of typeDoms) {
      typeDom.classList.add(disSelector);
    }

    const enabledSelectorsList = {

      '0': [], // none
      '1': ['.nadrs_output', '.nadrs_output_val'], // input
      '2': ['.nadrs_input', '.nadrs_input_val'], // output
      '3': ['.nadrs_input', '.nadrs_input_val', '.nadrs_output', '.nadrs_output_val'] // input/output

    }

    const enabledSelectors = enabledSelectorsList[device.props.type];

    for (const enabledSelector of enabledSelectors) {

      let currDom = device.dom.querySelector(enabledSelector);
      currDom.classList.remove(disSelector);

    }

  },

  'updateName'(device) {

      //add title attribute
      const {selector} = this.propertyMaps['name'];
      const dom = device.dom.querySelector(selector);
      dom.title = device.props.name;

    },

    'updateMessage'(device, propKey) {

      let {connectionId} = device.props;

      //getting message

      for (let connectedPathName of connectionId) {

        let messagePath = this.getMessagePath(device, connectedPathName);
        let opts = Object.assign({}, this.messageDefault, {
          propKey: 'input',
          propValue: device.props[propKey],
          sourcePathName: device.pathName,
        });

        this.transferMessage(messagePath, opts);
      }

    },

    messageDefault: {
      propKey: undefined,
      propValue: 'none'
    },

    transferMessage(messagePath, opts) {

      let pathName = messagePath.shift();
      let device = this.getDeviceByPath(pathName);

      if(messagePath.length === 0) {

        if(!device) {
          // console.log('Device does not exist');
          return;
        }

        this.updateProperty(device, opts.propKey, opts.propValue);

      } else {

        this.transferMessage(messagePath, opts);

      }

    },

    getMessagePath(device1, connectedPathName) {

    //get OWN HUB
    let device2 = this.getDeviceByPath(connectedPathName);
    let hub1 = this.getHub(device2);
    let hub2 = this.getHubByPath(device2);
    
    return [ device1, hub1, hub2, device2 ];
  },

  getHub(device) {
    let pathName = device.pathName.split('/')[0]:
    
    
    return pathName.split('/')[0];
  },

  getDeviceByPath(pathName) {

    let matchDevice = undefined;

    for (const [uuid, device] of this.devices.entries() ) {

      if(pathName === device.pathName) {
        matchDevice = device;
        continue;
      }
    }

    return matchDevice;
  },

  removeDevice(opts) {

    const device = this.getDeviceByPath(opts.pathName);

    if(!device)
      return;

    this.devices.remove(device.uuid);

  },

  calcBounds(device) {

    const {elem} = device;
    const x = elem.attr('x');
    const y = elem.attr('y');
    const w = elem.attr('width');
    const h = elem.attr('height');
    const bounds = new cola.Rectangle(x, x + w, y, y + h);

    return bounds;

  },

  removeOverlaps() {

    const devices = this.devices.entries();
    const boundList = [];
    const deviceList = [];

    for (const [uuid, device] of devices) {

      const bounds = this.calcBounds(device);

      deviceList.push(device);
      boundList.push(bounds);

    }
    
    cola.removeOverlaps(boundList);

    for (let i = boundList.length; i--;) {

      const bounds = boundList[i];
      const device = deviceList[i];

      device.elem.move(bounds.x, bounds.y);

    }

  },

  update() {
    requestAnimationFrame(this.update.bind(this));
  },

}

export { VIZ };