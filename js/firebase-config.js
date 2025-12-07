(function () {
  window.FIREBASE_DB_URL = 'https://sirahdata-default-rtdb.europe-west1.firebasedatabase.app/sirahData.json';

  window.FIREBASE_CONFIG = {
    apiKey: 'AIzaSyCCcMbp04njyia8mApWc1xb82qdexU9cyQ',
    authDomain: 'sirahdata.firebaseapp.com',
    projectId: 'sirahdata',
    storageBucket: 'sirahdata.firebasestorage.app',
    messagingSenderId: '103389148822',
    appId: '1:103389148822:web:9d17b91789099b62eff4b7',
    measurementId: 'G-SGBNK4TPDE'
  };

  if (window.firebase && window.firebase.apps?.length === 0) {
    window.firebase.initializeApp(window.FIREBASE_CONFIG);
  }

  if (window.firebase?.auth) {
    const auth = window.firebase.auth();
    auth
      .signInAnonymously()
      .catch((error) => {
        console.warn('Firebase auth failed', error);
      });

    auth.onIdTokenChanged((user) => {
      if (!user) return;
      user
        .getIdToken()
        .then((token) => {
          window.FIREBASE_ID_TOKEN = token;
          window.dispatchEvent(
            new CustomEvent('firebase-token', {
              detail: token
            })
          );
          console.log('Firebase: تمت المصادقة المجهولة');
        })
        .catch((error) => {
          console.warn('تعذر الحصول على رمز الهوية من Firebase', error);
        });
    });
  }
})();
