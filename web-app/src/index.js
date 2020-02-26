import { initializeFirebase, getAddressById, isValidAddress } from './firebase'

(async () => {
  const firebase = await initializeFirebase()
  const db = firebase.database()
  const dbRoot = db.ref('/HUBS')
  const snapHubs = await dbRoot.once('value')
  let hubs = snapHubs.val()

  snapHubs.ref.on('value', (newSnapHubs) => {
    const newHubs = newSnapHubs.val()
    
    for (const [hubName, adresses] of Object.entries(hubs)) {
      for (const { address } of adresses) {
        const addressId = `${hubName}/${address}`
        const lastAddress = getAddressById(hubs, addressId)
        const newAddress = getAddressById(newHubs, addressId)

        if (JSON.stringify(lastAddress) !== JSON.stringify(newAddress)) {
          if (!isValidAddress(lastAddress) && isValidAddress(newAddress)) {
            console.log('New address')
          } else if (isValidAddress(lastAddress) && isValidAddress(newAddress)) {
            console.log('Update address')
          } else if (isValidAddress(lastAddress) && !isValidAddress(newAddress)) {
            console.log('Delete address')
          }
        }
      }
    }

    hubs = newHubs
  })
})()
