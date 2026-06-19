import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
    collection,
    getDocs,
    addDoc,
    orderBy,
    query,
    where
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBxMp2iKRS-0BMGTLspMfRnF47IFrehb6c",
    authDomain: "chesspose.firebaseapp.com",
    databaseURL: "https://chesspose-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chesspose",
    storageBucket: "chesspose.firebasestorage.app",
    messagingSenderId: "610238818821",
    appId: "1:610238818821:web:84f41a6537d750836eca6c",
    measurementId: "G-F4H00D6EN2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function uploadPost(fen, title, content) {
    let newDoc = {
        fen: fen,
        title: title,
        content: content,
    };
    await addDoc(collection(db, "chessPost"), newDoc);
}

export async function loadPostByFen(fen) {
    let postCollection = collection(db, "chessPost");
    let postQuery = query(postCollection, where("fen", "==", fen));

    const querySnapshot = await getDocs(postQuery);
    const allData = [];

    querySnapshot.docs.forEach((doc) => {
        const newData = { postTitle: doc.data().title, postContent: doc.data().content }
        allData.push(newData);
    })
    
    return allData;
}