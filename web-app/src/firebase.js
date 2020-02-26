import config from '../config'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

export const initializeFirebase = () => {
  return new Promise((resolve, reject) => {
    firebase.initializeApp(config)
    firebase
      .auth()
      .signInAnonymously()
      .catch(function(error) {
        const { code } = error
        reject(`anonymously auth error ----- ${code}`)
      })
    
    resolve(firebase)
  })
}

export const getAddressId = (hubName, address) => {
  return hubName && address ? `${hubName}/${address}` : null;
}

export const getAddressByIndex = (hub, index) => {
  return Object.values(hub)[parseInt(index)];
}

export const getAddressById = (hubs, id) => {
  const [hubName, addressNum] = id.split('/')
  return hubs[hubName].find(({ address }) => address === addressNum)
}

export const isValidAddress = (address) => {
  const { name } = address
  return name && name !== 'undefined'
}

export const isValidConnection = (connection) => {
  const { hub_name: hubName, id: index } = connection
  return hubName && hubName !== 'none' && index && index !== 'none'
}