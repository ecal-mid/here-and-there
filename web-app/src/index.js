import { initializeFirebase, getAddressById, getAddressId, getAddressByIndex, isValidAddress, isValidConnection } from './firebase';
import { VIZ } from './visualisation';

(async () => {


  function formatAddressProps (address, hubs) {
    const { connection, address: addressName } = address;
    const { hub_name: hubName, id: index } = connection

    const connectionHub = hubs[hubName];

    let connectionId = null;

    if(isValidConnection(connection)) {

      let connectionAddressName = getAddressByIndex(connectionHub, parseInt(index)).address;
      connectionId = getAddressId(hubName, connectionAddressName);

    }

    return {
      ...address,
      connectionId
    }
  }

  VIZ.init(0,0,1000,1000);


  const firebase = await initializeFirebase();
  const db = firebase.database();
  const dbRoot = db.ref('/HUBS');
  const snapHubs = await dbRoot.once('value');

  let hubs = snapHubs.val();

  for (const [hubName, adresses] of Object.entries(hubs)) {
    for (const address of adresses) {
      if (isValidAddress(address)) {
        const props = formatAddressProps(address, hubs)
        const { address: addressName } = address;

        let id = getAddressId(hubName, addressName);

        VIZ.addNode({
          id,
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
            const props = formatAddressProps(newAddress, hubs)
            const { address: addressName } = newAddress;

            VIZ.addNode({
              id: getAddressId(hubName, addressName),
              props
            });

          } else if (isValidAddress(lastAddress) && isValidAddress(newAddress)) {

            console.log('Update address');

            const props = formatAddressProps(newAddress, hubs);

            VIZ.updateNode({
              id: addressId,
              props
            });

          } else if (isValidAddress(lastAddress) && !isValidAddress(newAddress)) {

            console.log('Delete address');
            console.log(addressId);

            VIZ.removeNode({id: addressId});

          }
        }
      }
    }
    
    hubs = newHubs;
  });

  VIZ.removeOverlaps();


})();