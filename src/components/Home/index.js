import React from 'react';
import {compose} from "recompose";

//Adding higher-order authorization component to add a broad authorization rule to the HomePage component
import {withAuthorization, withEmailVerification} from '../Session';

const HomePage = () => (
    <div>
        <h1>Home</h1>
        <p>The Home Page is accessible by every signed in user.</p>
    </div>
);

const condition = authUser => !!authUser;

export default compose(withEmailVerification, withAuthorization(condition))(HomePage);