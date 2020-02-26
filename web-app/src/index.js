import { initializeFirebase } from './firebase'

(async () => {
  const firebase = await initializeFirebase()
  const db = firebase.database()
  const hubs = db.ref('/HUBS')
  console.log(hubs)
})()
