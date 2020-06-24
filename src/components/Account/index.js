import React, {Component} from 'react';
import {compose} from "recompose";

import {PasswordForgetForm} from "../PasswordForget";
import PasswordChangeForm from "../PasswordChange";
import {AuthUserContext, withAuthorization, withEmailVerification} from '../Session';
import {withFirebase} from '../Firebase';

//NOTE. USED TO MANAGE SOCIAL LOGINS

const SIGN_IN_METHODS = [
    {
        id: 'password',
        provider: null,
    },
    {
        id: 'google.com',
        provider: 'googleProvider',
    },
    {
        id: 'facebook.com',
        provider: 'facebookProvider',
    },
    {
        id: 'twitter.com',
        provider: 'twitterProvider',
    }

]


const AccountPage = () => (
    <AuthUserContext.Consumer>
        {authUser => (
            <div>
                <h1>Account: {authUser.email}</h1>
                <PasswordForgetForm/>
                <PasswordChangeForm/>
                <LoginManagement authUser={authUser}/>
            </div>
        )}
    </AuthUserContext.Consumer>
);

class LoginManagementBase extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeSignInMethods: [],
            error: null,
        }
    }

    componentDidMount() {
        this.fetchSignInMethods();
    }

    fetchSignInMethods = () => {
        this.props.firebase.auth
            .fetchSignInMethodsForEmail(this.props.authUser.email)
            .then(activeSignInMethods =>
                this.setState({activeSignInMethods, error:null}),
            )
            .catch(error => this.setState({error}));
    };

    onSocialLoginLink = provider => {
        this.props.firebase.auth.currentUser
            .linkWithPopup(this.props.firebase[provider])
            .then(this.fetchSignInMethods)
            .catch(error => this.setState({error}))
    };

    onUnlink = providerId => {
        this.props.firebase.auth.currentUser
            .unlink(providerId)
            .then(this.fetchSignInMethods)
            .catch(error => this.setState({error}));
    };

    render() {
        const{activeSignInMethods, error} = this.state;

        return (
            <div>
            Sign In Methods
            <ul>
                {SIGN_IN_METHODS.map(signInMethod => {
                    const onlyOneLeft = activeSignInMethods.length === 1;
                    const isEnabled = activeSignInMethods.includes(
                        signInMethod.id,
                    );

                    return(
                        <li key={signInMethod.id}>
                            {isEnabled ? (
                                    <button
                                        type="button"
                                        onClick={() =>this.onUnlink(signInMethod.id)}
                                        disabled={onlyOneLeft}>
                                        Deactivate {signInMethod.id}
                                    </button>)
                                :
                                (<button type="button"
                                         onClick={() => this.onSocialLoginLink(signInMethod.provider)}
                                    >
                                    Link {signInMethod.id}
                                </button>
                                )}
                        </li>
                    );
                })}
            </ul>
                {error && error.message}
            </div>
        );
    }
}

const LoginManagement = withFirebase(LoginManagementBase);

//This condition needs to be meet in order for this route to be shown.
const condition = authUser => !!authUser;

export default compose(withEmailVerification, withAuthorization(condition))(AccountPage);
