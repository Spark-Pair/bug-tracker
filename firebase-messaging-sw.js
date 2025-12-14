importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyATZVFJ-fjcbEDdTay6FXFFnnOFxYRFT14",
  authDomain: "bug-tracker-f5906.firebaseapp.com",
  projectId: "bug-tracker-f5906",
  messagingSenderId: "494871945336",
  appId: "1:494871945336:web:acd04ea28c9793eef08d8d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon-192.png'
  });
});
