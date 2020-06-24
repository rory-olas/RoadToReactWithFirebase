import React from 'react';

import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';

import AuthUserContext from "./context";
import {withFirebase} from '../Firebase';
import * as ROUTES from '../../constants/routes';



const withAuthorization = condition => Component => {
    class WithAuthorization extends React.Component {

        //This is where the authorization logic takes place.
        //The firebase.auth.onAuthStateChanged triggers a callback function every time the authenticated user changes.
        //The authenticated user is either a authUser object or null.
        //The condition function is executed with the authUser object and the if condition passes without any change.
        // It fails if authUser is null.
        //NOTE. THIS LOGIC IS EXTRACTED TO FIREBASE.JS. IT IS STORED IN THE ONAUTHUSERLISTENER METHOD IN THE FIREBASE CLASS
        // componentDidMount() {
        //     this.listener = this.props.firebase.auth.onAuthStateChanged(
        //         authUser => {
        //                 //NOTE. WE NEED TO MERGE THE AUTHENTICATION USER AND DATABASE USER IN THIS COMPONENT BEFORE CHECKING FOR ITS PRIVILEGES (ROLES & PERMISSIONS)
        //                 if (authUser) {
        //                     this.props.firebase
        //                         .user(authUser.uid)
        //                         //NOTE. ONCE INSTEAD OF ON - ONLY CHECK THIS ONE TIME
        //                         .once('value')
        //                         .then(snapshot => {
        //                             const dbUser = snapshot.val();
        //                             console.log(dbUser);
        //
        //                         //    default empty roles
        //                             if(dbUser.roles) {
        //                                 dbUser.roles={};
        //                             }
        //
        //                         //    merge auth and db user
        //                             authUser = {
        //                                 uid: authUser.uid,
        //                                 email: authUser.email,
        //                                 ...dbUser,
        //                             };
        //                             //Now check to see if the condition is met - ie. the user is authorized.
        //                             if(!condition(authUser)) {
        //                                 this.props.history.push(ROUTES.SIGN_IN);
        //                             }
        //                         });
        //                 } else {
        //                 this.props.history.push(ROUTES.SIGN_IN);
        //             }
        //         },
        //     );
        // }

        //NOTE. THE FOLLOWING CODE RUNS THE SAME AS THE CODE ABOVE, BUT IT STORED IN THE FIREBASE.JS FILE TO SHIELD IT AWAY AND ALLOW IT TO BE USED MULTIPLE TIMES

        componentDidMount() {
            this.listener = this.props.firebase.onAuthUserListener(
                authUser => {
                    if(!condition(authUser)){
                        this.props.history.push(ROUTES.SIGN_IN);
                    }
                },
                () => this.props.history.push(ROUTES.SIGN_IN),
            );
        }


        componentWillUnmount(){
            this.listener();
        }

        render() {
            return(
                //This refactor means that we'll check the users Auth status before rendering the page at all.
                //Otherwise it renders the page really quickly and then flashes back to the home route.
                <AuthUserContext.Consumer >
                    {authUser => condition(authUser)
                        ? <Component {...this.props}/>
                        : null}
                </AuthUserContext.Consumer>
                )
        }
    }

    return compose(withRouter, withFirebase,)(WithAuthorization);
};

//This is a higher-order component. At is most basic it takes a component as an input and returns it as an output.
//The higher-order component should receive a condition function as a parameter.
//Based on that condition function, this should decide to direct the user back to a public route instead of the protected route.

export default withAuthorization;