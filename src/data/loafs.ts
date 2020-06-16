//import firebase from '@react-native-firebase/app';
import {firebase , FirebaseStorageTypes} from '@react-native-firebase/storage';
import firestore, {
    FirebaseFirestoreTypes, 
} from '@react-native-firebase/firestore';
import { Loaf } from './types';

export async function getLoafs(): Promise<FirebaseFirestoreTypes.CollectionReference> {
    return firestore().collection('loafs');
}

export async function getLoaf(loafId : string): Promise<FirebaseFirestoreTypes.DocumentReference> {
    return firestore().collection('loafs').doc(loafId);
}

export async function likeLoaf(loafId : string): Promise<void> {
    let loaf = firestore().collection('loafs').doc(loafId);
    let oldLoaf = (await loaf.get()).data().loaf;
    oldLoaf.score = oldLoaf.score+1;
    return await loaf.update({loaf: oldLoaf});
}

export async function createLoaf(loaf: Loaf, imagePath: string): Promise<FirebaseFirestoreTypes.DocumentReference> {
    let ref: FirebaseFirestoreTypes.DocumentReference | PromiseLike<FirebaseFirestoreTypes.DocumentReference>;
    try {
        const loafsRef = await getLoafs();
        ref = await loafsRef.add({loaf});
    
        //upload image
        const userLoafRef = await getUserLoafRef(ref.id);
        let task = await userLoafRef.putFile(imagePath, 
            {});
        console.log('task is: ' + task.state + ' and has metadata: size:' + task.metadata.size + ' name: ' + task.metadata.name
            + ' contentType: ' + task.metadata.contentType + ' fullPath: ' + task.metadata.fullPath);
        console.log("loaf created successfully. loaf ref id: " + ref.id + ' .  filepath was: ' +imagePath)
    }
    catch (err) {
        console.log(err.message)
        alert(err.message)
    }
    return ref;
}

export async function getLoafImageUrl(loafId: string): Promise<string> {
    const userLoafRef = await getUserLoafRef(loafId);
    return await userLoafRef.getDownloadURL();
}

export async function getUserLoafRef(loafId: string): Promise<FirebaseStorageTypes.Reference> {
    if (!loafId) {
        return Promise.reject("Can't access image without loafId");
    }

    const storageRef = firebase.storage().ref();
    return storageRef.child('userLoafs').child(loafId);
}