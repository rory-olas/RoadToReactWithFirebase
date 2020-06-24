import React from 'react';
import {withFirebase} from '../Firebase';
import AuthUserContext from './context';

//To keep the application clean, we are extracting the checking for authentication from App/index.js to this separate file.

const withAuthentication = Component => {
    class withAuthentication extends React.Component {

        constructor(props) {
            super(props);

            this.state = {
                authUser: null
            };
        }

        componentDidMount() {
            this.listener = this.props.firebase.onAuthUserListener(
                authUser => {
                    this.setState({authUser});
                },
                () => {
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
