const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "da8trqsqz"
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"

export async function uploadFile(
  path: string, 
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", UPLOAD_PRESET)
    // Cloudinary folder can be set based on the path
    formData.append("folder", path)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, true)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100
        onProgress(progress)
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText)
        resolve(response.secure_url)
      } else {
        console.error("Cloudinary upload failed", xhr.responseText)
        reject(new Error("Cloudinary upload failed"))
      }
    }

    xhr.onerror = () => {
      reject(new Error("Network error during Cloudinary upload"))
    }

    xhr.send(formData)
  })
}

export async function deleteFile(fileUrl: string) {
  // Deleting from client-side with unsigned uploads is restricted for security.
  // In a real app, this would be a server-side call.
  console.log("Delete called for:", fileUrl, "(Client-side deletion skipped for Cloudinary)")
  return true
}
