const admin = require("firebase-admin");
const serviceAccount = require("/Users/user/Downloads/ai-video-86922-firebase-adminsdk-fbsvc-dc443a8481 (1).json");

// Define bucket names to check
const bucketsToTry = [
  "ai-video-86922.appspot.com",
  "ai-video-86922.firebasestorage.app"
];

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function run() {
  for (const bucketName of bucketsToTry) {
    console.log(`\nChecking bucket: ${bucketName}...`);
    try {
      const bucket = admin.storage().bucket(bucketName);
      
      // Set CORS policy required by Firebase Web SDK for browser uploads
      await bucket.setCorsConfiguration([
        {
          origin: ["*"],
          method: ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
          maxAgeSeconds: 3600,
          responseHeader: ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"]
        }
      ]);
      console.log(`✅ CORS successfully configured for bucket: ${bucketName}`);
    } catch(e) {
      console.log(`❌ Bucket ${bucketName} error: ${e.message}`);
    }
  }
}

run();
