import React from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";

import Navigation from '../Navigation';
import LandingPage from "../Landing";
import SignUpPage from "../SignUp";
import SignInPage from "../SignIn";
import PasswordForgetPage from "../PasswordForget";
import HomePage from "../Home";
import AccountPage from "../Account";
import AdminPage from "../Admin";

import * as ROUTES from '../../constants/routes';
import {withAuthentication} from "../Session";

//Extracted out to withAuthentication
// import {withFirebase} from '../Firebase';
import {AuthUserContext} from '../Session';



//This is all extracted out to the Session folder - withAuthentication
// class App extends Component {
//     constructor(props) {
//         super(props);
//
//         this.state = {
//             authUser: null,
//         };
//     }

    //authUser is initialized as null in the constructor above.
    // in componentDidMount we have a firebase listener that will change authUser in state to be true if firebase auth returns true.
    //Ths listener is included so that we can remove it when the component Unmounts to avoid memory leaks and performance issues.



const App = () => (

            //Extracted out to withAuthentication in the Session folder
            // <AuthUserContext.Provider value={this.state.authUser}>
            <Router>
                <div>
                    <Navigation />
                    {/*The method below passed this.state.authUser directly to the Navigation component. Instead we use AuthUserContext above to pass it to all routes.*/}
                    {/*<Navigation authUser={this.state.authUser}/>*/}
                    <hr/>

                    <Route exact path={ROUTES.LANDING} component={LandingPage} />
                    <Route exact path={ROUTES.SIGN_UP} component={SignUpPage} />
                    <Route exact path={ROUTES.SIGN_IN} component={SignInPage} />
                    <Route exact path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage} />
                    <Route exact path={ROUTES.HOME} component={HomePage} />
                    <Route exact path={ROUTES.ACCOUNT} component={AccountPage} />
                    <Route exact path={ROUTES.ADMIN} component={AdminPage} />
                </div>
            </Router>
            // </AuthUserContext.Provider>
        );

export default withAuthentication(App);