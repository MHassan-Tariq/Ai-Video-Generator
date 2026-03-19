const admin = require("firebase-admin");
require("dotenv").config({ path: ".env.local" });

const serviceAccount = require("/Users/user/Downloads/ai-video-86922-firebase-adminsdk-fbsvc-dc443a8481 (1).json");

// Initialize the Firebase Admin SDK using the original JSON file directly
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function seed() {
  const email = "admin@gmail.com";
  const password = "Admin@123";

  console.log("Starting seeder for Admin user...");

  try {
    let userRecord;
    try {
      // Check if user already exists
      userRecord = await auth.getUserByEmail(email);
      console.log(`[Auth] User ${email} already exists.`);
      
      // Force update password to make sure it's correct
      await auth.updateUser(userRecord.uid, { password });
      console.log(`[Auth] Updated password for ${email}.`);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        // Create new user in Firebase Auth
        userRecord = await auth.createUser({
          email,
          password,
          emailVerified: true
        });
        console.log(`[Auth] Successfully created new user: ${userRecord.uid}`);
      } else {
        throw e;
      }
    }

    // Now assign the 'admin' role in the Firestore 'users' collection
    // This is required by AuthContext.tsx to allow login
    await db.collection("users").doc(userRecord.uid).set({
      email: userRecord.email,
      role: "admin",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`[Firestore] Admin privileges successfully assigned to UID: ${userRecord.uid}`);
    console.log("\n✅ SEEDING COMPLETE! You can now log into the web app using:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seed();
