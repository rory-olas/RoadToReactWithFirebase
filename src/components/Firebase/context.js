import React, {Component} from "react";

const FirebaseContext = React.createContext(null);

export const withFirebase = Component => props => (
    <FirebaseContext.Consumer>
        {firebase => <Component {...props} firebase={firebase}/>}
    </FirebaseContext.Consumer>
);

export default FirebaseContext;

//NOTE. THE CREATECONTEXT() FUNCTION ESSENTIALLY CREATES TWO COMPONENTS - THE FIREBASE CONTEXT PROVIDER
//WHICH IS USED TO PROVIDE FIREBASE ONCE AT THE TOP-LEVEL OF THE REACT COMPONENT TREE
//AND THE FIREBASE CONTEXT CONSUMER WHICH IS USED TO RETRIEVE THE FIREBASE INSTANCE
//IF IT IS NEEDED IN THE REACT COMPONENT.