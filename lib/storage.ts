import { storage } from "./firebase"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"

export async function uploadFile(
  path: string, 
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create a unique filename
    const uniqueFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const storageRef = ref(storage, `${path}/${uniqueFileName}`)
    
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        if (onProgress) {
          onProgress(progress)
        }
      },
      (error) => {
        console.error("Error uploading file:", error)
        reject(error)
      },
      async () => {
        try {
          // Upload completed successfully, now we can get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadURL)
        } catch (error) {
          console.error("Error getting download URL:", error)
          reject(error)
        }
      }
    )
  })
}

export async function deleteFile(fileUrl: string) {
  try {
    // Only attempt to delete if it's a firebase storage URL
    if (!fileUrl.includes('firebasestorage.googleapis.com')) {
      return true
    }
    
    // Create a reference to the file to delete
    const fileRef = ref(storage, fileUrl)
    await deleteObject(fileRef)
    return true
  } catch (error) {
    console.error(`Error deleting file from storage:`, error)
    // Don't throw here, as we often want to proceed with deleting the document 
    // even if the file deletion slightly fails (e.g. file already deleted)
    return false
  }
}
