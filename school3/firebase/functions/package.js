{
  "name": "functions",
  "description": "MathCloud Tutorial Academy Firebase Cloud Functions",
  "private": true,
  "main": "index.js",
  "engines": {
    "node": "22"
  },
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "dependencies": {
    "firebase-admin": "^13.4.0",
    "firebase-functions": "^6.4.0"
  }
}

