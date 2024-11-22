// Import required modules
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

// Initialize Firebase Admin SDK
admin.initializeApp();

exports.changeUserPassword = functions.https.onCall(async (data, context) => {
  //   // Security check: Ensure the user calling this is authorized
  //   if (!context.auth || !context.auth.token.admin) {
  //     throw new functions.https.HttpsError(
  //       "permission-denied",
  //       "Only administrators can change user passwords."
  //     );
  //   }

  // Extract user ID and new password from the request data
  const { uid, newPassword } = data;

  if (!uid || !newPassword) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      'The function must be called with both "uid" and "newPassword".'
    );
  }

  try {
    // Update the user's password
    await admin.auth().updateUser(uid, {
      password: newPassword,
    });

    return { message: `Password successfully updated for user: ${uid}` };
  } catch (error) {
    console.error("Error updating password:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to update the password."
    );
  }
});

// Cloud Function to fetch and serve HTML content
exports.loadPageFromUrl = functions.https.onRequest(async (req, res) => {
  const url = req.query.url; // Pass the URL as a query parameter, e.g., ?url=https://example.com

  if (!url) {
    return res.status(400).send("URL parameter is required");
  }

  try {
    // Fetch HTML content from the URL
    const response = await axios.get(url, { responseType: "text" });

    // Return the HTML content
    res.set("Content-Type", "text/html");
    res.status(200).send(response.data);
  } catch (error) {
    console.error("Error fetching the URL:", error.message);
    res.status(500).send("Failed to load content from the URL.");
  }
});
