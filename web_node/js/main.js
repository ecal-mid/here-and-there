window.addEventListener('load', function() {


	DATA.init({
		database: firebase.database(),
	});

});

const DATA = {

	addresses: new Map(),

	async init(opts) {

		const defaults = {
			database: undefined,
			hubs: {},
			rawData: undefined,
		}

		Object.assign(this, defaults, opts);

		await this.addListeners();

		// await this.address.addListeners();


		// console.log('Current simplified hub list:\n', this.hubs);
	},

	addListeners() {

		return new Promise((resolve, reject) => {

			const hubs_ref = this.database.ref('/HUBS');

			hubs_ref.once('value', (hubs_snap) => {

				resolve();

				// this.rawData = snapshot.val();
				// this.hubs = this.simplifyHubs(this.rawData);
				// resolve(this.hubs);


				hubs_snap.forEach((hub_snap) => {

					hub_snap.forEach((address_snap) => {

						let fullPath = hub_snap.ref.toString();
						let node = new Address_node({
							path: fullPath,
							snapshot: address_snap,
						});

						this.addresses.set(fullPath, node);

					});
				});
			});

		});
	},

	simplifyHubs(data) {

		let simpleHubs = {};
		let forbiddenNames = ["undefined"];

		for (let hubName in data) {

			let rawHub = data[hubName];

			simpleHubs[hubName] = rawHub.filter(addressObj => forbiddenNames.indexOf(addressObj.name) === -1);

		}

		return simpleHubs;

	},
}

class Address_node {

	constructor(opts) {
		let defaults = {
			dom: undefined,
			snapshot: undefined,
			path: '',
			props: {},
			forbiddenNames: ['undefined'],
		}

		Object.assign(this, defaults, opts);

		this.snapshot.ref.on('value', this.onChanges.bind(this));
	}

	onChanges(snapshot) {

		let oldProps;
		let currProps = snapshot.val();

		if(typeof currProps !== 'object')
			return;

		//check if still a valid node, else delete
		if(!this.canAppear(currProps)) {
			this.selfDisappear();
			return;
		}

		oldProps = this.props;
		this.props = currProps;

		// console.log(JSON.stringify(this.props));

		if(!this.dom)
			this.createDom();

		//check properties changes
		for (let key in this.props) {

			let newVal = this.props[key];

			if(!UTILS.areSameObj(newVal, oldProps[key])) {

				console.log(`${oldProps.name} ${key} updated:`, newVal);

				let methodName = key + '_change';

				//call "[key]_change" methods
				if(methodName in this) {
					this[methodName]({key: key, value: newVal});
				}
			}
		}
	}

	selfDisappear() {

		if(this.dom === undefined)
			return;

		// this.dom.parentElement.removeChild(this.dom);
	}

	canAppear(currProps = this.props) {
		return (this.forbiddenNames.indexOf(currProps.name) === -1);
	}

	//****** called methods by attribute name from Firebase

	'address_change'(event) {

	}

	'connection_change'(event) {

	}

	'message_change'(event) {

	}

	'name_change'(event) {
		// console.log('hheyyyy', event);

		// if(this.canAppear()) {
		// 	console.log('delete this');
		// } else {
		// 	console.log('fuck this');
		// }
	}

	'type_change'(event) {

	}

	//****** 

	createDom() {

		// this.dom.






	}

}

const UTILS = {

	areSameObj(var1, var2) {
		let str1 = JSON.stringify(var1) + '';
		let str2 = JSON.stringify(var2) + '';

		return str1 === str2;
	} 

		// setSettings(settings = {}, defaults = {}, values = {}) {

		// 	return Object.assign(settings, defaults, values);

		// },

		// loopObject(obj, callback) {

		// 	let keys = Object.getOwnPropertyNames(obj);

		// 	for(let i = keys.length; i--;) {

		// 		let key = keys[i];
		// 		let value = obj[key];

		// 		callback.call(this, key, value);
		// 	}
		// }

	}