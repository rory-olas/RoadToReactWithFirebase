import React, {Component} from 'react';
import {Link, withRouter} from "react-router-dom";
import { compose} from "recompose";


import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

const SignUpPage = () => (
    <div>
        <h1>SignUp</h1>
        <SignUpForm/>
    </div>
);

const INITIAL_STATE = {
    username: '',
    email: '',
    passwordOne: '',
    passwordTwo: '',
    //Adding Roles to signUp so that we can track authorization based on roles.
    isAdmin: false,
    error: null,
};


class SignUpFormBase extends Component {
    constructor(props) {
        super(props);

        this.state= {...INITIAL_STATE};
    }

    //NOTE. THIS USES THE FIREBASE AUTH FUNCTIONALITY TO CREATE A USER
    onSubmit = event => {
        const { username, email, passwordOne, isAdmin } = this.state;

        //NOTE. ADDING A CONSTANT ROLES WHICH WILL HOUSE THE ROLES FOR AUTHORIZATION
        const roles = {};

        if(isAdmin) {
            roles[ROLES.ADMIN] = ROLES.ADMIN;
        }

        this.props.firebase
            .doCreateUserWithEmailAndPassword(email, passwordOne)
            .then (authUser => {
                //Create a user in your Firebase realtime database at the same place where we are signing a user up.
                return this.props.firebase
                    .user(authUser.user.uid)
                    .set({
                        username,
                        email,
                        roles,
                    });
            })
            .then(() => {
                this.setState({ ...INITIAL_STATE});
                this.props.history.push(ROUTES.HOME);
            })
            .catch(error => {
                this.setState({error})
            });
        event.preventDefault();
    };

    //NOTE. THIS SNIPPET OF CODE TRIES TO DO TWO THINGS - 1. CREATE A USER IN FIREBASE"S INTERNAL AUTHENTICATION DATABASE
    //WHICH IS SECURE AND ENCRYPTED AND PROVIDES LIMITED ACCESS
    //2. IF 1. IS SUCCESSFUL, IT CREATES A USER IN FIREBASE'S REALTIME DATABASE THAT IS ACCESSIBLE FOR FURTHER USE.

    //NOTE. THIS SETS THE STATE BASED ON THE USER'S INPUT
    onChange = event => {
        this.setState({[event.target.name]: event.target.value});
    };

    onChangeCheckbox = event => {
        this.setState({ [event.target.name] : event.target.checked});
    };

    render() {

        //NOTE. THIS CONST HOLDS THE LOCAL STATE
        const {
            username,
            email,
            passwordOne,
            passwordTwo,
            isAdmin,
            error
        } = this.state;

        //NOTE. THIS CONST IS USED IN THE SUBMIT TO RESTRICT THE USER FROM SUBMITTING THE FORM UNLESS THESE CRITERIA ARE MET.
        const isInvalid =
            passwordOne !== passwordTwo ||
            passwordOne === '' ||
            email === '' ||
            username === '';

        return (
            <form onSubmit={this.onSubmit}>
                <input
                    name="username"
                    value={username}
                    onChange={this.onChange}
                    type="text"
                    placeholder={'Full Name'}/>
                <input
                    name="email"
                    value={email}
                    onChange={this.onChange}
                    type="text"
                    placeholder={'Email Address'}/>
                <input
                    name="passwordOne"
                    value={passwordOne}
                    onChange={this.onChange}
                    type="password"
                    placeholder={'Password'}/>
                <input
                    name="passwordTwo"
                    value={passwordTwo}
                    onChange={this.onChange}
                    type="password"
                    placeholder={'Confirm Password'}/>
                    <label>
                        Admin:
                        <input
                        name="isAdmin"
                        type="checkbox"
                        checked={isAdmin}
                        onChange={this.onChangeCheckbox}
                        />
                    </label>

                    <button disabled={isInvalid} type={'submit'}>
                        Sign Up
                    </button>
                {error && <p>{error.message}</p>}
            </form>
        );
    }
}

const SignUpLink = () => (
    <p>
        Don't have an account? <Link to={ROUTES.SIGN_UP} >Sign Up</Link>
    </p>
)

const SignUpForm = compose( withRouter, withFirebase)(SignUpFormBase);


export default SignUpPage;

export {SignUpForm, SignUpLink}