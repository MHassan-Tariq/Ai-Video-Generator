const admin = require("firebase-admin");
const serviceAccount = require("../../../Downloads/ai-video-86922-firebase-adminsdk-fbsvc-dc443a8481 (1).json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function run() {
  try {
    const bucket = admin.storage().bucket("ai-video-86922.appspot.com");
    const [exists] = await bucket.exists();
    console.log("Bucket ai-video-86922.appspot.com exists:", exists);

    // Let's set CORS just in case
    await bucket.setCorsConfiguration([
      {
        origin: ["*"],
        method: ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
        maxAgeSeconds: 3600,
        responseHeader: ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"]
      }
    ]);
    console.log("CORS updated for ai-video-86922.appspot.com");
  } catch(e) {
    console.log("Error with appspot.com bucket:", e.message);
  }
}
run();
