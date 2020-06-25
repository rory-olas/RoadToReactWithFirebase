import React, {Component} from 'react';
import {compose} from "recompose";

//Adding higher-order authorization component to add a broad authorization rule to the HomePage component
import {withAuthorization, withEmailVerification} from '../Session';
import {withFirebase} from '../Firebase';

const HomePage = () => (
    <div>
        <h1>Home</h1>
        <p>The Home Page is accessible by every signed in user.</p>

        <Messages />
    </div>
);

//THE MESSAGES COMPONENT HAS A LOCAL STATE FOR A LOADING INDICATOR AND THE LIST OF MESSAGES.

class MessageBase extends Component{

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            messages: [],
        };
    }

    componentDidMount() {
        this.setState({loading:true});

        //WHEN MESSAGES CHANGE (CREATE, UPDATE, REMOVE), THE CALLBACK FUNCTION IN THE LISTENER IS TRIGGERED
        // AND FIREBASE PROVIDES A SNAPSHOT OF THE DATA
        this.props.firebase.messages().on('value', snapshot => {

        //    ADDING FEATURE TO TURN MESSAGES FROM AND EMPTY ARRAY IN STATE TO NULL IF THERE ARE NO MESSAGES.
        //    WE'LL THEN RENDER THE LIST CONDITIONALLY BELOW.

            const messageObject = snapshot.val();

            if(messageObject) {
                //    HERE WE WILL CONVERT THAT SNAPSHOT INTO A MESSAGE LIST

                const messageList = Object.keys(messageObject).map( key => ({
                    ...messageObject[key],
                    uid: key,
                }));

                this.setState({
                    messages: messageList,
                    loading: false
                });
            } else {
                this.setState({messages: null, loading: false})
            }


            // this.setState({loading:false})
        });
    }

    componentWillUnmount() {
        //DISMOUNT THE MESSAGES LISTENER TO AVOID MEMORY LEAKS
        this.props.firebase.messages().off();
    }

    render() {
        const {messages, loading} = this.state;

        return (
            <div>
            {loading && <div>Loading...</div>}

            {/*ADDING CONDITIONAL RENDERING TO SHOW THE USER SOMETHING IF THERE ARE NO MESSAGES*/}
                {messages ? (
                    <MessageList messages={messages}/>
                ): (
                    <div> There are no messages ... </div>
                )}
            </div>
        );
    }
}

//THE MESSAGEBASE STORES TAKES THE SNAPSHOT FROM FIREBASE AND NEEDS TO EXTRACT THE MESSAGES AND PASS THEM THROUGH TO THE MESSAGELIST
//THE MESSAGE LIST WILL MAP OVER MESSAGES AND CRETE A MESSAGEITEM FOR EACH MESSAGE.
//THE MESSAGE ITEM WILL DISPLAY THE ACTUAL MESSAGE

const MessageList = ({messages}) => (
    <ul>
        {messages.map(message => (
            <MessageItem key={message.id} message={message}/>
        ))}
    </ul>
);

const MessageItem = ({message}) => (
    <li>
        <strong>{message.userId}</strong> {message.text}
    </li>
);

const Messages = withFirebase(MessageBase);

const condition = authUser => !!authUser;

export default compose(withEmailVerification, withAuthorization(condition))(HomePage);