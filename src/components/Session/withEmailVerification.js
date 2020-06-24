import React, {Component} from 'react';

import AuthUserContext from "./context";
import {withFirebase} from "../Firebase";

//NOTE. THIS IS A HIGHER ORDER COMPONENT WHO'S JOB IT IS TO CHECK IF THE USER HAS VERIFIED THEIR EMAIL.

//It the user is logged in through social logins, they won't need to have verified their email address.
const needsEmailVerification = authUser =>
    authUser &&
    !authUser.emailVerified &&
    authUser.providerData
        .map(provider => provider.providerId)
        .includes('password');

const withEmailVerification = Component => {
    class WithEmailVerification extends React.Component{
        constructor(props) {
            super(props);

            this.state = { isSent: false}
        }

        onSendEmailVerification = () =>{
            this.props.firebase
                .doSendEmailVerification()
                .then(() => this.setState({isSent: true}));
        };

        render() {
            return (
                <AuthUserContext.Consumer>
                    {authUser =>
                        needsEmailVerification(authUser) ? (
                            <div>
                                {this.state.isSent ? (<p>Email confirmation sent: check your emails</p>) : (
                                <p>
                                    Verify your Email: Check your emails for a confirmation email or send another
                                    confirmation email.
                                </p> )}

                                <button
                                    type='button'
                                    onClick={this.onSendEmailVerification}
                                    disabled={this.state.isSent}>

                                    Send confirmation email
                                </button>
                            </div>
                        ) : (
                            <Component {...this.props}/>
                        )
                    }
                </AuthUserContext.Consumer>
            );
        }
    }

    return withFirebase(WithEmailVerification);
};

export default withEmailVerification;