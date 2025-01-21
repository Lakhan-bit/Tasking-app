

const admin = require('firebase-admin');
const serviceAccount = require('../tasking-app-937a3-firebase-adminsdk-fbsvc-be7bb11d69.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;


// const firecheck =async(req,res)=>{
//     // try {
//     //     const data = req.body;
//     //     const docRef = db.collection('users').doc('alovelace');

//     //     await docRef.set({
//     //         first: 'reymi',
//     //         last: 'lakhan',
//     //         born: 1223
//     //     });
//     //     res.json({message:'api correct',data});
//     // } catch (error) {
//     //     res.json({status:'error'});
//     // }

//     try {
//         const { name } = req.body;
//         const newUserRef = await db.collection('users').add({ name });
//         res.status(201).json({ id: newUserRef.id, message: 'User added successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

// module.exports = firecheck;