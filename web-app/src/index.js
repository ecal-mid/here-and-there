import { initializeFirebase, getAddressById, getAddressId, getAddressByIndex, isValidAddress, isValidConnection } from './firebase';
import { VIZ } from './visualisation';

(async () => {

  function formatAddressProps (address, hubs) {
    const { connection, address: addressName } = address;
    const { hub_name: hubName, id: index } = connection

    const connectionHub = hubs[hubName];

    let connectionId = [];

    if(isValidConnection(connection)) {

      let connectionAddressName = getAddressByIndex(connectionHub, parseInt(index)).address;
      let addressId = getAddressId(hubName, connectionAddressName);

      connectionId = [addressId];
    }

    return {
      ...address,
      connectionId
    }
  }

  let ratio = window.innerHeight/window.innerWidth;
  let size = 2000;

  VIZ.init(0,0, size, size);

  const firebase = await initializeFirebase();
  const db = firebase.database();
  const dbRoot = db.ref('/HUBS');
  const snapHubs = await dbRoot.once('value');

  let hubs = VIZ.hubs = snapHubs.val();
  VIZ.updateHubDatabase(hubs);

  // Create device modules
  // console.log(hubName);  

  for (const [hubName, adresses] of Object.entries(hubs)) {

    VIZ.addDevice({
      pathName: hubName,
      type: 'hub',
      props: {name: hubName}
    });

    for (const address of adresses) {


      if (isValidAddress(address)) {
        const props = formatAddressProps(address, hubs);
        const { address: addressName } = address;

        let id = getAddressId(hubName, addressName);

        VIZ.addDevice({
          pathName: id,
          props
        });
      }
    }
  }

  snapHubs.ref.on('value', (newSnapHubs) => {
    const newHubs = newSnapHubs.val();

    for (const [hubName, adresses] of Object.entries(hubs)) {

      for (const { address } of adresses) {

        const addressId = getAddressId(hubName, address);
        const lastAddress = getAddressById(hubs, addressId);
        const newAddress = getAddressById(newHubs, addressId);

        if (JSON.stringify(lastAddress) !== JSON.stringify(newAddress)) {

          if (!isValidAddress(lastAddress) && isValidAddress(newAddress)) {

            console.log('New address');
            const props = formatAddressProps(newAddress, hubs);
            const { address: addressName } = newAddress;

            VIZ.addDevice({
              pathName: id,
              props
            });

          } else if (isValidAddress(lastAddress) && isValidAddress(newAddress)) {

            console.log('Update address');

            const props = formatAddressProps(newAddress, hubs);

            VIZ.updateDevice({
              pathName: addressId,
              props
            });

          } else if (isValidAddress(lastAddress) && !isValidAddress(newAddress)) {

            console.log('Delete address');

            VIZ.removeDevice({pathName: addressId});

          }
        }
      }
    }

    hubs = newHubs;
    VIZ.updateHubDatabase(newHubs);

  });

  VIZ.removeOverlaps();


})();