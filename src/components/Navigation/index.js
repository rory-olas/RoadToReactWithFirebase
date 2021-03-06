import React from 'react';
import {Link} from 'react-router-dom';
import SignOutButton from '../SignOut'

import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';
import {AuthUserContext} from '../Session';

//here we are refactoring this navigation path so that the Navigation const takes a prop of authUse from the App. If authUser is true, it will show NavigationAuth. If it is false, it will show NavigationNonAuth
const Navigation = () => (
    <div>
        {/*The AuthUserContext.Consumer below passes in the state of Auth user from Session/context and App*/}
        <AuthUserContext.Consumer>
        {authUser =>
            authUser ? (
                <NavigationAuth authUser={authUser}/>
                ) : (
                    <NavigationNonAuth />
                    )}
        </AuthUserContext.Consumer>
    </div>
    );

const NavigationAuth = ({authUser}) => (
        <ul>
            <li>
                <Link to={ROUTES.LANDING}>Landing</Link>
            </li>
            <li>
                <Link to={ROUTES.HOME}>Home</Link>
            </li>
            <li>
                <Link to={ROUTES.ACCOUNT}>Account</Link>
            </li>
            {!!authUser.roles[ROLES.ADMIN] && (
            <li>
                <Link to={ROUTES.ADMIN}>Admin</Link>
            </li>
            )}
            <li>
                <SignOutButton />
            </li>
        </ul>
);

const NavigationNonAuth = () => (
    <ul>
        <li>
            <Link to={ROUTES.LANDING}>Landing</Link>
        </li>
        <li>
            <Link to={ROUTES.SIGN_IN}>Sign In</Link>
        </li>
    </ul>
    );

export default Navigation;