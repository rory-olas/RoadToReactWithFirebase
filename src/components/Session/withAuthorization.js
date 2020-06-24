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
        componentDidMount() {
            this.listener = this.props.firebase.auth.onAuthStateChanged(
                authUser => {
                        if(!condition(authUser)) {
                        this.props.history.push(ROUTES.SIGN_IN);
                    }
                },
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