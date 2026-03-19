import { db } from "./firebase"
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp
} from "firebase/firestore"

export async function getCollection(path: string, orderField?: string, orderDirection: "asc" | "desc" = "asc") {
  try {
    let q;
    if (orderField) {
      q = query(collection(db, path), orderBy(orderField, orderDirection));
    } else {
      q = query(collection(db, path));
    }
    
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (!orderField) {
      results.sort((a: any, b: any) => {
        const timeA = a.created_at?.seconds || 0;
        const timeB = b.created_at?.seconds || 0;
        
        // Fallback to sorting by order index if timestamps are dead even or don't exist
        if (timeA === timeB) {
            return (b.order || 0) - (a.order || 0);
        }
        return timeB - timeA;
      });
    }
    return results;
  } catch (error) {
    console.error(`Error getting collection ${path}:`, error)
    throw error
  }
}

export async function getDocument(path: string, id: string) {
  try {
    const docRef = doc(db, path, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error(`Error getting document ${path}/${id}:`, error)
    throw error
  }
}

export async function addDocument(path: string, data: any) {
  try {
    const docRef = await addDoc(collection(db, path), {
      ...data,
      created_at: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error(`Error adding document to ${path}:`, error)
    throw error
  }
}

export async function updateDocument(path: string, id: string, data: any) {
  try {
    const docRef = doc(db, path, id)
    await updateDoc(docRef, {
      ...data,
      updated_at: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error(`Error updating document ${path}/${id}:`, error)
    throw error
  }
}

export async function deleteDocument(path: string, id: string) {
  try {
    const docRef = doc(db, path, id)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error(`Error deleting document ${path}/${id}:`, error)
    throw error
  }
}
