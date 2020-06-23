import app from 'firebase/app'
import 'firebase/auth';
import 'firebase/database';

const prodConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

const devConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

const config =
    process.env.NODE_ENV === 'production' ? prodConfig : devConfig;
//NOTE. USING THE .ENV FILE TO STORE SENSITIVE FIREBASE KEYS.

//NOTE. INITIALIZING FIREBASE
class Firebase {
    constructor() {
        app.initializeApp(config);

        //We imported auth from firebase above which allows us to use this.auth.firebase (below) elsewhere in the application
        this.auth = app.auth();

        //We import database from firebase above which allows us to access the firebase database (below) elsewhere in the applicaiton
        this.db = app.database();
    }

//    AUTH API //
//    These methods allow us to authenticate the user and change their password as required.
    doCreateUserWithEmailAndPassword = (email, password) =>
        this.auth.createUserWithEmailAndPassword(email, password);

    doSignInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password);

    doSignOut = () => this.auth.signOut();

    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

    doPasswordUpdate = password => this.auth.currentUser.updatePassword(password);

//    User API //
//    These methods allow us to access collections or paths in the firebase database.

    user = uid => this.db.ref('users/${uid}');

    users = () => this.db.ref('users');
}


export default Firebase;