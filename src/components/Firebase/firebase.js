import app from 'firebase/app'
import 'firebase/auth';
import 'firebase/database';

const config = {
    apiKey: 'AIzaSyC4QYjAnm9r4XLhT-mnmgCcLu8yIYRESQc',
    authDomain: 'roadtoreact-3d629.firebaseapp.com',
    databaseURL: 'https://roadtoreact-3d629.firebaseio.com',
    projectId: 'roadtoreact-3d629',
    storageBucket: 'roadtoreact-3d629.appspot.com',
    messagingSenderId: '534461127629',
};



const devConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

// const config =
//     process.env.NODE_ENV === 'production' ? prodConfig : devConfig;
//NOTE. USING THE .ENV FILE TO STORE SENSITIVE FIREBASE KEYS.

//NOTE. INITIALIZING FIREBASE
class Firebase {
    constructor() {
        app.initializeApp(config);

        //We imported auth from firebase above which allows us to use this.auth.firebase (below) elsewhere in the application
        this.auth = app.auth();

        //We import database from firebase above which allows us to access the firebase database (below) elsewhere in the applicaiton
        this.db = app.database();

    //    Setting Up the Google Social Login provider
        this.googleProvider = new app.auth.GoogleAuthProvider();

    //    Setting up the Facebook Social Login Provider
        this.facebookProvider = new app.auth.FacebookAuthProvider();

        //    Setting up the Twitter Social Login Provider
        this.twitterProvider = new app.auth.TwitterAuthProvider();

    }


//    AUTH API //
//    These methods allow us to authenticate the user and change their password as required.
    doCreateUserWithEmailAndPassword = (email, password) =>
        this.auth.createUserWithEmailAndPassword(email, password);

    doSignInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password);

    doSignInWithGoogle = () =>
        this.auth.signInWithPopup(this.googleProvider);

    doSignInWithFacebook = () =>
        this.auth.signInWithPopup(this.facebookProvider);

    doSignInWithTwitter = () =>
        this.auth.signInWithTwitter(this.twitterProvider);

    doSendEmailVerification = () =>
        this.auth.currentUser.sendEmailVerification({
            url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT,
        });


    doSignOut = () => this.auth.signOut();

    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

    doPasswordUpdate = password => this.auth.currentUser.updatePassword(password);

//    MERGE AUTH AND DB USER API //
//    This is an extraction of the functionality we implemented in withAuthorization and withAuthentication

    onAuthUserListener = (next, fallback) =>
        this.auth.onAuthStateChanged(authUser => {
            if(authUser) {
                this.user(authUser.uid)
                    .once('value')
                    .then(snapshot => {
                        const dbUser = snapshot.val();

                    //    default empty roles
                        if(!dbUser.roles) {
                            dbUser.roles= {};
                        }

                    //    merge auth and db user
                        authUser = {
                            uid: authUser.uid,
                            email:authUser.email,
                            emailVerified: authUser.emailVerified,
                            providerData: authUser.providerData,
                            ...dbUser,
                        };

                        next(authUser);
                    });
            } else {
                fallback();
            }
        });


//    USER API //
//    These methods allow us to access collections or paths in the firebase database.

    user = uid => this.db.ref(`users/${uid}`);

    users = () => this.db.ref('users');
}


export default Firebase;