// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: '',
  //baseUrl: 'http://18.175.98.27:4000/',
  baseUrl :'http://192.168.29.19:4005/',
  //baseUrl : 'https://www.fbcoach.com:4000/',
  firebaseConfig: {
    apiKey: "AIzaSyAeYMD4HLgcRUz4eIXTFNgu9ADJMkz5P_g",
    authDomain: "finding-balance-7920f.firebaseapp.com",
    projectId: "finding-balance-7920f",
    storageBucket: "finding-balance-7920f.appspot.com",
    messagingSenderId: "1015006060095",
    appId: "1:1015006060095:web:69ec8a8513fb389dcd628a",
    measurementId: "G-TYC5XTBX16",
    vapidKey: "BL9aycmHcxZ2Ja2JD2ybe27Toc0B9p83seAtfNpGmGWjivIj0SkMAroX2VvzVDcI_N1eY_Gotjuv7J6dvzAhK2M"
  }
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
