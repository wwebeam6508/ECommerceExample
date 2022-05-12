import { doc, getDoc, getFirestore } from "firebase/firestore"


export async function getUserData(uid) {
    const db = getFirestore()
    const usersRef = doc(db, "users", uid)
    const user_doc = await getDoc(usersRef)
    return user_doc.data()
} 