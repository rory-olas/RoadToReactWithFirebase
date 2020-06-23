import React from 'react';

//Adding higher-order authorization component to add a broad authorization rule to the HomePage component
import {withAuthorization} from '../Session';

const HomePage = () => (
    <div>
        <h1>Home</h1>
        <p>The Home Page is accessible by every signed in user.</p>
    </div>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(HomePage);