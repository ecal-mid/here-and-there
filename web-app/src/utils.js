const UTILS = {

 	createUUID: function() {
		var dt = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (dt + Math.random()*16)%16 | 0;
			dt = Math.floor(dt/16);
			return (c=='x' ? r :(r&0x3|0x8)).toString(16);
		});
		return uuid;
	},

	areSameSimpleObj: function(obj1, obj2) {

		obj1 = JSON.stringify(obj1) + '';
		obj2 = JSON.stringify(obj1) + '';

		return obj1 === obj2;
	}
}

export default UTILS;
