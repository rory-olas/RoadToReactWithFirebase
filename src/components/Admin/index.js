import React, {Component} from 'react';
import {Switch, Route, Link} from 'react-router-dom';
import {compose} from 'recompose';

import {withFirebase} from "../Firebase";
import {withAuthorization, withEmailVerification} from '../Session';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';


const AdminPage = () => (
    <div>
        <h1>Admin</h1>
        <p>
            The Admin Page is accessible by every signed in admin user.
        </p>


        <Switch>
            <Route exact path={ROUTES.ADMIN} component={UserList}/>
            <Route exact path={ROUTES.ADMIN_DETAILS} component={UserItem}/>
        </Switch>

    </div>
);


//The AdminPage is changed from a class (below) to a const and all this logic goes into the UserListBase
// class AdminPage extends Component{
//     constructor(props) {
//         super(props);
//
//         this.state = {
//             loading: false,
//             users: [],
//         };
//     }
//
//     componentDidMount() {
//         this.setState({loading: true});
//
//         //NOTE. WE ARE USING THE USERS REFERENCER FROM OUR FIREBASE CLASS TO ATTACH A LISTENER CALLED ON()
//         // THAT LISTENER RECEIVES A TYPE AND A CALLBACK FUNCTION
//         //ON() REGISTERS A CONTINUOUS LISTENER THAT TRIGGERS EVERY TIME SOMETHING CHANGES. ONCE() IS A METHOD THAT REGISTERS ONLY ONCE.
//
//         //THE USERS ARE OBJECTS WHEN THEY ARE RETRIEVED FROM THE FIREBASE DATABASE, SO WE NEED TO RESTRUCTURE THEM AS LISTS (ARRAYS) TO MAKE THEM EASIER TO DISPLAY
//
//         this.props.firebase.users().on('value',snapshot => {
//
//             //NOTE. WE GET THE VALUE FROM THE DATABASE IN A SNAPSHOT AS OBJECTS. SO WE ASSIGN THEM TO THE CONST USEROBJECTS
//             //AND THEN WE MAP THROUGH THOSE OBJECTS AND CREATE A LIST OF ITEMS CALLED USERSLIST. WHICH WE THEN SET AS USERS IN STATE.
//             //END RESULT IS USERS IN STATE GOES FROM AN EMPTY ARRAY TO AN ARRAY OF ALL THE USERS IN THE DATABASE
//             const usersObject = snapshot.val();
//
//             const usersList = Object.keys(usersObject).map(key => ({
//                 ...usersObject[key],
//                 uid: key,
//             }));
//
//             this.setState({
//                 users: usersList,
//                 loading: false
//             });
//         });
//     }
//
//     componentWillUnmount() {
//         //NOTE. THIS REMOVES THE LISTENER TO AVOID MEMORY LEAKS FROM THE COMPONENT DID MOUNT LIFECYCLE METHOD.
//         this.props.firebase.users().off();
//     }
//
//     render() {
//     const {users, loading} = this.state;
//
//         return(
//             <div>
//                 <h1>Admin</h1>
//                 <p>
//                     The Admin Page is accessible by every signed in admin user.
//                 </p>
//
//
//                 <Switch>
//                     <Route exact path={ROUTES.ADMIN_DETAILS} component={UserItem}/>
//                     <Route exact path={ROUTES.ADMIN} component={UserList}/>
//                 </Switch>
//
//                 {loading && <div>Loading....</div>}
//
//                 {/*Removed because we added in the Route above to extract this out.*/}
//                 {/*<UserList users={users} />*/}
//             </div>
//         );
//     }
// }

class UserListBase extends Component{
    //NOTE. This is the same business logic as in the old AdminPage class.

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            users: [],
        };
    }

    componentDidMount() {
        this.setState({loading: true});

        this.props.firebase.users().on('value',snapshot => {

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
        this.props.firebase.users().off();
    }

 render() {
     const {users, loading} = this.state;

     return (
         <div>
             <h2>Users</h2>
             {loading && <div>Loading...</div>}
             <ul>
                 {users.map(user => (
                     <li key={user.uid}>
                         <span>
                             <strong>ID:</strong> {user.id}
                         </span>
                         <span>
                            <strong>E-Mail:</strong> {user.email}
                         </span>
                         <span>
                            <strong>Username:</strong> {user.username}
                         </span>
                         <span>
                             <Link
                                 to={{
                                 pathname: `${ROUTES.ADMIN}/${user.uid}`,
                                 state: {user},
                             }}>
                                 Details
                             </Link>
                         </span>
                     </li>
                 ))}
             </ul>
         </div>
     );
 }
}

// const UserList = ({users}) => (
//     <ul>
//         {users.map(user => (
//             <li key={user.uid}>
//                 <span>
//                     <strong>ID:</strong> {user.uid}
//                 </span>
//                 <span>
//                     <strong>E-Mail:</strong> {user.email}
//                 </span>
//                 <span>
//                     <strong>Username:</strong> {user.username}
//                 </span>
//             </li>
//         ))}
//     </ul>
// );


class UserItemBase extends Component{
constructor(props) {
    super(props);

    this.state = {
        loading: false,
        user: null,
        ...props.location.state,
    };
}

componentDidMount() {
    if (this.state.user) {
        return;
    }

    this.setState({loading:true});

    this.props.firebase
        .user(this.props.match.params.id)
        .on('value', snapshot => {
            this.setState({
                user: snapshot.val(),
                loading: false,
            });
        });
}

componentWillUnmount() {
    this.props.firebase.user(this.props.match.params.id).off();
}

onSendPasswordResetEmail = () => {
    this.props.firebase.doPasswordReset(this.state.user.email);
};

render() {
    const  {user, loading} = this.state;
console.log(this.props.match.params.id);
    return (
        <div>
        <h2>User ({this.props.match.params.id})</h2>
            {loading && <div>Loading...</div>}

            {user && (
                <div>
                    <span>
                        <strong>ID:</strong> {user.uid}
                    </span>
                    <span>
                        <strong>E-Mail:</strong> {user.email}
                    </span>
                    <span>
                        <strong>Username:</strong> {user.username}
                    </span>
                    <span>
                        <button
                            type="button"
                            onClick={this.onSendPasswordResetEmail}
                        >
                            Send Password Reset
                        </button>
                    </span>
                </div>
            )}
        </div>
    );
}
}

// const UserItem = ({match}) => (
//     <div>
//         <h2>User ({match.params.id})</h2>
//     </div>
// );

const condition = authUser =>
    authUser && !!authUser.roles[ROLES.ADMIN];

const UserList = withFirebase(UserListBase);
const UserItem = withFirebase(UserItemBase);

export default compose(withAuthorization(condition), withFirebase, withEmailVerification)(AdminPage);