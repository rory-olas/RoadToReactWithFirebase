import React from 'react';

import {PasswordForgetForm} from "../PasswordForget";
import PasswordChangeForm from "../PasswordChange";
import {AuthUserContext, withAuthorization} from '../Session';

const AccountPage = () => (
    <AuthUserContext.Consumer>
        {authUser => (
            <div>
                <h1>Account: {authUser.email}</h1>
                <PasswordForgetForm/>
                <PasswordChangeForm/>
            </div>
        )}
    </AuthUserContext.Consumer>
);

//This condition needs to be meet in order for this route to be shown.
const condition = authUser => !!authUser;

export default withAuthorization(condition)(AccountPage);
