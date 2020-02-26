import { initializeFirebase, getAddressById, getAddressId, getAddressByIndex, isValidAddress, isValidConnection } from './firebase';
import { VIZ } from './visualisation';

(async () => {


  function formatAddressProps (address, hubs) {
    const { connection, address: addressName } = address;
    const { hub_name: hubName, id: index } = connection

    const connectionHub = hubs[hubName]
    const { address: connectionAddress } = isValidConnection(connection)
      ? getAddressByIndex(connectionHub, parseInt(index))
      : {}

    return {
      ...address,
      connectionId: getAddressId(hubName, connectionAddress)
    }
  }

  // let id, props;

  // id = '#1';
  // props = {
  //   address:"0x8",
  //   connection: {hub_name:"HUB poop", id: '8', path:"#2"},
  //   message:"none",
  //   name:"hello",
  //   type:"0"
  // };

  // VIZ.addNode({id: id, props: props});

  // id = '#2';
  // props = {
  //   address:"0x10",
  //   connection: {hub_name:"HUB hey", id: '10', path:'#1'},
  //   message:"none",
  //   name:"fuck",
  //   type:"1"
  // };

  // VIZ.addNode({id: id, props: props });

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

        VIZ.addNode({
          id: getAddressId(hubName, addressName),
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


})();