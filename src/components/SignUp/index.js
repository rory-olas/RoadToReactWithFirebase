import React, {Component} from 'react';
import {Link, withRouter} from "react-router-dom";
import { compose} from "recompose";


import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

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
    error: null,
};


class SignUpFormBase extends Component {
    constructor(props) {
        super(props);

        this.state= {...INITIAL_STATE};
    }

    //NOTE. THIS USES THE FIREBASE AUTH FUNCTIONALITY TO CREATE A USER
    onSubmit = event => {
        const { username, email, passwordOne } = this.state;

        this.props.firebase
            .doCreateUserWithEmailAndPassword(email, passwordOne)
            .then (authUser => {
                this.setState({ ...INITIAL_STATE});
                this.props.history.push(ROUTES.HOME);
            })
            .catch(error => {
                this.setState({error})
            });
        event.preventDefault();
    };

    //NOTE. THIS SETS THE STATE BASED ON THE USER'S INPUT
    onChange = event => {
        this.setState({[event.target.name]: event.target.value});
    };

    render() {

        //NOTE. THIS CONST HOLDS THE LOCAL STATE
        const {
            username,
            email,
            passwordOne,
            passwordTwo,
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