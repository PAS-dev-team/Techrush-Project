const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Verifies a Google Identity Services ID token and returns its payload
// (sub, email, email_verified, name, ...). Throws if the token is
// invalid, expired, or wasn't issued for this app.
async function verifyGoogleIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
}

module.exports = { verifyGoogleIdToken, GOOGLE_CLIENT_ID };
