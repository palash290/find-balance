// src/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAeYMD4HLgcRUz4eIXTFNgu9ADJMkz5P_g",
  authDomain: "finding-balance-7920f.firebaseapp.com",
  projectId: "finding-balance-7920f",
  storageBucket: "finding-balance-7920f.appspot.com",
  messagingSenderId: "1015006060095",
  appId: "1:1015006060095:web:69ec8a8513fb389dcd628a",
  measurementId: "G-TYC5XTBX16",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  //console.log('Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'No Title';
  const notificationOptions = {
    body: payload.notification?.body || 'No Body',
    icon: payload.notification?.icon || '/firebase-logo.png'
  };
  console.log('Received background message ', notificationTitle);
  console.log('Received background message1 ', notificationOptions);
  //self.registration.showNotification(notificationTitle, notificationOptions);
 
});