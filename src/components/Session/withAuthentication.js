import React from 'react';
import {withFirebase} from '../Firebase';
import AuthUserContext from './context';

//To keep the application clean, we are extracting the checking for authentication from App/index.js to this separate file.

const withAuthentication = Component => {
    class withAuthentication extends React.Component {

        constructor(props) {
            super(props);

            this.state = {
                authUser: JSON.parse(localStorage.getItem('authUser')),
            };

        //    NOTE. IF THERE IS NO AUTHUSER IN THE LOCAL STORAGE, THIS WILL REVERT TO NULL.
        //    THIS MEANS THAT THE USER CAN REFREASH THE BROWSER AND THAT ANNOYING FLICKER WILL BE GONE.
        //    AND THAT THEY CAN LEAVE THE SITE AND RETURN AND STILL BE LOGGED IN
        }

        componentDidMount() {
            this.listener = this.props.firebase.onAuthUserListener(
                authUser => {
                    localStorage.setItem('authUser', JSON.stringify(authUser));
                    this.setState({authUser});
                },
                () => {
                    localStorage.removeItem('authUser');
                    this.setState({authUser:null});
                },
            );
        }


        //NOTE. THIS IS ALL EXTRACTED OUT TO THE FIREBASE.JS FILE AND THE ABOVE CODE IS USED INSTEAD

        // componentDidMount() {
        //     this.listener = this.props.firebase.auth.onAuthStateChanged(
        //         authUser => {
        //             if(authUser) {
        //                 this.props.firebase
        //                     .user(authUser.uid)
        //                     .once('value')
        //                     .then(snapshot => {
        //                         const dbUser = snapshot.val();
        //
        //                     //    default empty roles
        //                         if(!dbUser.roles) {
        //                             dbUser.roles = {};
        //                         }
        //
        //                     //    merge auth and db user
        //                         authUser = {
        //                             uid: authUser.uid,
        //                             email: authUser.email,
        //                             ...dbUser,
        //                         };
        //
        //                         this.setState({authUser});
        //                     });
        //             } else {
        //                 this.setState({ authUser: null});
        //             }
        //         },
        //     );
        // }

        componentWillUnmount() {
            this.listener();
        }

        render() {
            return (
            <AuthUserContext.Provider value={this.state.authUser}>
            <Component {...this.props} />
            </AuthUserContext.Provider>
            );
        }
    }

    return withFirebase(withAuthentication);
};

export default withAuthentication;
