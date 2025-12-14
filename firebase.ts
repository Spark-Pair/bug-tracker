import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyATZVFJ-fjcbEDdTay6FXFFnnOFxYRFT14",
  authDomain: "bug-tracker-f5906.firebaseapp.com",
  projectId: "bug-tracker-f5906",
  messagingSenderId: "494871945336",
  appId: "1:494871945336:web:acd04ea28c9793eef08d8d"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const getFCMToken = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  return await getToken(messaging, {
    vapidKey: 'BGYb850p445p8MqqGaAFLPjEDIkYbRCHRN_bgzywk35AufbN8J9pI-6yQ9t6WtCKqV4gYZCpRsdQ78K5VhrnxNc'
  });
};
