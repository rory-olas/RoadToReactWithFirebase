import React, {Component} from 'react';
import {compose} from 'recompose';

import {withFirebase} from "../Firebase";
import {withAuthorization, withEmailVerification} from '../Session';
import * as ROLES from '../../constants/roles';

class AdminPage extends Component{
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            users: [],
        };
    }

    componentDidMount() {
        this.setState({loading: true});

        //NOTE. WE ARE USING THE USERS REFERENCER FROM OUR FIREBASE CLASS TO ATTACH A LISTENER CALLED ON()
        // THAT LISTENER RECEIVES A TYPE AND A CALLBACK FUNCTION
        //ON() REGISTERS A CONTINUOUS LISTENER THAT TRIGGERS EVERY TIME SOMETHING CHANGES. ONCE() IS A METHOD THAT REGISTERS ONLY ONCE.

        //THE USERS ARE OBJECTS WHEN THEY ARE RETRIEVED FROM THE FIREBASE DATABASE, SO WE NEED TO RESTRUCTURE THEM AS LISTS (ARRAYS) TO MAKE THEM EASIER TO DISPLAY

        this.props.firebase.users().on('value',snapshot => {

            //NOTE. WE GET THE VALUE FROM THE DATABASE IN A SNAPSHOT AS OBJECTS. SO WE ASSIGN THEM TO THE CONST USEROBJECTS
            //AND THEN WE MAP THROUGH THOSE OBJECTS AND CREATE A LIST OF ITEMS CALLED USERSLIST. WHICH WE THEN SET AS USERS IN STATE.
            //END RESULT IS USERS IN STATE GOES FROM AN EMPTY ARRAY TO AN ARRAY OF ALL THE USERS IN THE DATABASE
            const usersObject = snapshot.val();

            const usersList = Object.keys(usersObject).map(key => ({
                ...usersObject[key],
                uid: key,
            }));

            this.setState({
                users: usersList,
                loading: false
            });
        });
    }

    componentWillUnmount() {
        //NOTE. THIS REMOVES THE LISTENER TO AVOID MEMORY LEAKS FROM THE COMPONENT DID MOUNT LIFECYCLE METHOD.
        this.props.firebase.users().off();
    }

    render() {
    const {users, loading} = this.state;

        return(
            <div>
                <h1>Admin</h1>
                <p>
                    The Admin Page is accessible by every signed in admin user.
                </p>

                {loading && <div>Loading....</div>}

                <UserList users={users} />
            </div>
        );
    }
}

const UserList = ({users}) => (
    <ul>
        {users.map(user => (
            <li key={user.uid}>
                <span>
                    <strong>ID:</strong> {user.uid}
                </span>
                <span>
                    <strong>E-Mail:</strong> {user.email}
                </span>
                <span>
                    <strong>Username:</strong> {user.username}
                </span>
            </li>
        ))}
    </ul>
);

const condition = authUser =>
    authUser && !!authUser.roles[ROLES.ADMIN];


export default compose(withAuthorization(condition), withFirebase, withEmailVerification)(AdminPage);