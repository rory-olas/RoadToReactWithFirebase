import React, {Component} from 'react';
import {compose} from "recompose";

//Adding higher-order authorization component to add a broad authorization rule to the HomePage component
//Adding AuthUserContext to be able to assign messages to users.
import {AuthUserContext, withAuthorization, withEmailVerification} from '../Session';
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
            text: '',
            loading: false,
            messages: [],
            limit: 5,
        };
    }

    componentDidMount() {
        //Moving all the functionality that was previously in componentDidMount to be outside the lifecycle method.
        this.onListenForMessages();
    }

    onListenForMessages() {
        this.setState({loading:true});

        //WHEN MESSAGES CHANGE (CREATE, UPDATE, REMOVE), THE CALLBACK FUNCTION IN THE LISTENER IS TRIGGERED
        // AND FIREBASE PROVIDES A SNAPSHOT OF THE DATA
        this.props.firebase
            .messages()
            //ADDING IN ORDERBYCHILD IN ORDER TO SORT/ORDER THE MESSAGES.
            .orderByChild('createdAt')
            //ADDING PAGINATION - SIMPLY PASS FIREBASE A LIMIT
            .limitToLast(this.state.limit)
            .on('value', snapshot => {

        //    ADDING FEATURE TO TURN MESSAGES FROM AND EMPTY ARRAY IN STATE TO NULL IF THERE ARE NO MESSAGES.
        //    WE'LL THEN RENDER THE LIST CONDITIONALLY BELOW.

            const messageObject = snapshot.val();

            if(messageObject) {
                //    HERE WE WILL CONVERT THAT SNAPSHOT INTO A MESSAGE LIST

                const messageList = Object.keys(messageObject).map( key => ({
                    ...messageObject[key],
                    uid: key,
                }))
                    //THIS REVERSES THE ARRAY THAT WAS CREATED ABOVE.
                    .reverse();

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

    //ADDING PAGINATION FUNCTIONALITY
    onNextPage = () => {
        this.setState(
            state => ({limit: state.limit + 5}),
            this.onListenForMessages,
        );
    };

    componentWillUnmount() {
        //DISMOUNT THE MESSAGES LISTENER TO AVOID MEMORY LEAKS
        this.props.firebase.messages().off();
    }

    //ONCHANGETEXT TAKES WHAT CHANGES IN THE INPUT IN THE FORM AND ASSIGNS THAT VALUE TO TEXT IN STATE
    onChangeText = event => {
        this.setState({text:event.target.value})
    };

    //ONCREATEMESSAGE TAKES THE VALUE FORM TEXT IN STATE AND PUSHS IT TO MESSAGES IN FIREBASE
    //ADDITIONALLY, WE TAKE THE AUTHUSER OBJECT FROM AUTHUSERCONTEXT AND PUSH THAT UID TO FIREBASE TOO.
    // SO NOW WHEN A MESSAGE IS CREATED, IT IS LINKED TO A USER'S ACCOUNT.

    onCreateMessage = (event,authUser) => {
        this.props.firebase.messages().push({
            text: this.state.text,
            userId: authUser.uid,
            createdAt: this.props.firebase.serverValue.TIMESTAMP,
        });

        this.setState({text: ''});

        event.preventDefault();
    };

    //ONREMOVEMESSAGE WILL BE USED TO DELETE A MESSAGE FORM THE DATABASE
    onRemoveMessage = uid => {
        this.props.firebase.message(uid).remove();
    };

    //ONEDITMESSAGE UPDATES A SPECIFIC MESSAGE. WHILE THIS IS UNUSUAL IN A CHAT APP, IT IS COMMON IN A FORUM.
    onEditMessage = (message, text) => {
            const { uid, ...messageSnapshot} = message;

        this.props.firebase.message(message.uid).set({
            ...messageSnapshot,
            text,
            editedAt: this.props.firebase.serverValue.TIMESTAMP,
        });
    };

    render() {
        //ADDING THE FORM WITH WHICH PEOPLE CAN CREATE A MESSAGE
        const {text, messages, loading} = this.state;

        return (
            <AuthUserContext.Consumer>
                {authUser => (
            <div>
                {!loading && messages && (
                    <button type="button" onClick={this.onNextPage}>
                        More
                    </button>
                )}

            {loading && <div>Loading...</div>}

            {/*ADDING CONDITIONAL RENDERING TO SHOW THE USER SOMETHING IF THERE ARE NO MESSAGES*/}
                {messages ? (
                    <MessageList
                        authUser ={authUser}
                        messages={messages}
                        onRemoveMessage={this.onRemoveMessage}
                        onEditMessage={this.onEditMessage}
                    />
                ): (
                    <div> There are no messages ... </div>
                )}

                <form onSubmit={event => this.onCreateMessage(event, authUser)}>
                    <input
                    type="text"
                    value={text}
                    onChange={this.onChangeText}
                    />
                    <button type="submit">Send</button>
                </form>
            </div>
                )}
            </AuthUserContext.Consumer>
        );
    }
}

//THE MESSAGEBASE STORES TAKES THE SNAPSHOT FROM FIREBASE AND NEEDS TO EXTRACT THE MESSAGES AND PASS THEM THROUGH TO THE MESSAGELIST
//THE MESSAGE LIST WILL MAP OVER MESSAGES AND CRETE A MESSAGEITEM FOR EACH MESSAGE.
//THE MESSAGE ITEM WILL DISPLAY THE ACTUAL MESSAGE


const MessageList = ({authUser, messages, onRemoveMessage, onEditMessage}) => (
    <ul>
        {messages.map(message => (
            <MessageItem
                         key={message.id}
                         authUser={authUser}
                         message={message}
                         onRemoveMessage={onRemoveMessage}
                         onEditMessage={onEditMessage}
            />
        ))}
    </ul>
);

//NOTE. MESSAGEITEM WAS A CONST BUT EDITING A MESSAGE INVOLVES A FEW MORE RENDERED ELEMENTS, BUSINESS LOGIC AND
// STATE IN THE MESSAGEITEM COMPONENT. SO WE REFACTORED IT TO A CLASS

class MessageItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editMode: false,
            editText: this.props.message.text,
        };
    }

//    FIRST CLASS METHOD ALLOWS THE USER TO TOGGLE FROM EDIT TO PREVIEW AND BACK
    onToggleEditMode = () => {
        this.setState(state => ({
            editMode: !state.editMode,
            editText: this.props.message.text,
        }));
    };

//    SECOND CLASS METHOD ALLOWS THE USER TO UPDATE THE TEXT
    onChangeEditText = event => {
        this.setState({editText: event.target.value});
    };

//    THIRD CLASS METHOD TO SUBMIT THE FINAL VALUE TO THE PARENT COMPONENT
    onSaveEditText = () => {
        this.props.onEditMessage(this.props.message, this.state.editText);

        this.setState({editMode: false});
    };


    render() {
        const {authUser, message, onRemoveMessage} = this.props;
        const {editMode, editText} = this.state;

        return (
            <li>
                {editMode ? (
                    <input
                        type="text"
                        value={editText}
                        onChange={this.onChangeEditText}
                    />
                ) : (
                    <span>
            <strong>{message.userId}</strong> {message.text}
                        {message.editedAt && <span>(Edited)</span>}
            </span>
                )}

                {authUser.uid === message.userId && (
                    <span>
                {editMode ? (
                    <span>
                    <button onClick={this.onSaveEditText}>Save</button>
                    <button onClick={this.onToggleEditMode}>Reset</button>
                </span>
                ) : (
                    <button onClick={this.onToggleEditMode}>Edit</button>
                )}

                {!editMode && (
                    <button
                        type="button"
                        onClick={() => onRemoveMessage(message.uid)}
                    >
                        Delete
                    </button>
                )}
                </span>
                )}
            </li>
        )
    }
};


const Messages = withFirebase(MessageBase);

const condition = authUser => !!authUser;

export default compose(withEmailVerification, withAuthorization(condition))(HomePage);