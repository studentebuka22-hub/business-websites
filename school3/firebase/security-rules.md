# ==========================================================
# MathCloud Tutorial Academy
# Firebase Realtime Database Security Rules
# File: firebase/security-rules.md
# ==========================================================

{
  "rules": {

    ".read": false,

    ".write": false,

    "users": {

      "$uid": {

        ".read": "auth != null && auth.uid === $uid",

        ".write": "auth != null && auth.uid === $uid"

      }

    },

    "superAdmins": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "admins": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "students": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "teachers": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "parents": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "classes": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "subjects": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "departments": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "attendance": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "results": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "lessonNotes": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "assignments": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "cbt": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "theoryExams": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "timetable": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "fees": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "payments": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "notifications": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "messages": {

      ".read": "auth != null",

      ".write": "auth != null"

    },

    "gallery": {

      ".read": true,

      ".write": "auth != null"

    },

    "events": {

      ".read": true,

      ".write": "auth != null"

    },

    "news": {

      ".read": true,

      ".write": "auth != null"

    },

    "settings": {

      ".read": true,

      ".write": "auth != null"

    },

    "logs": {

      ".read": "auth != null",

      ".write": "auth != null"

    }

  }

}