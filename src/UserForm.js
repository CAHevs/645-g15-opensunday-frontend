import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter, Link, Route } from 'react-router-dom';

class UserForm extends React.Component {
    constructor() {
      super();
      this.state = {
        newUser: this.emptyUser,
      };
      /* Add a ref for the title text input */
      // this.titleInputRef = React.createRef();
    }
  
    /* Emtpy book used in initial state and for resetting the form */
    emptyUser = { firstname: '', lastname: '', email: '', phone: '', isCreator: 'false', ref_auth:'' };
  
    /* Form input change handler */
    handleFormInputChange = (event) => {

      const target = event.target;
      const value = target.value;
      const name = target.name;
  
      /*
      Update state dynamically by spreading the existing
      newBook object (...prevState.newBook) and overriding
      the property based on the input name ([name]: value)
      The second form of setState is used, as we are
      basing the new value on the previous state
       */
      this.setState((prevState) => ({
        newUser: { ...prevState.newUser, [name]: value },
      }));
    };
  
    /* Form submission handler */
    handleFormSubmit = async (event) => {
      /* Prevent the form submission from reloading the page */
      event.preventDefault();
  
      /* We now call the server to create our new book in the DB */
      /* Method is POST (for creation of resources)              */
      /* Content-Type header is set to application/json          */
      /* The body is the newBook object, stringified as JSON     */
      // let newUserResponse = await fetch(process.env.REACT_APP_BOOKS_URL, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(this.state.newUser),
      // });
  
      /* Get the response body, parsed from JSON */
      let newUser = this.emptyUser;
  
      /* Call the "add book" function that is passed as a prop */
      this.props.addUser(newUser);
  
      /* Reset the new book state */
      // this.resetUser();
  
      /* Focus on the book title after adding a new book */
      //this.focusBookTitle();
    };
  
    /* Method for focusing on the book title, using the created ref */
    // focusBookTitle = (event) => {
    //   /* Use "current" to access the DOM element linked to the ref */
    //   /* and use the browser API method "focus"                    */
    //   this.titleInputRef.current.focus();
    // };
  
    /* Reset the new book object */
    resetNewUser = () => {
      this.setState({ newUser: this.emptyUser });
    };
  
    render() {
      return (
        <>
          {/* Render a form allowing to add a new book to the list */}
          <h2>Register yourself !</h2>
          <form onSubmit={this.handleFormSubmit} className="NewUser-Form">
            {/* All inputs have been replaced with FormInput components */}
            <input
              /* Link the created ref to the title input */
              fieldRef={this.titleInputRef}
              type="text"
              name="title"
              value={this.state.newUser.firstname}
              onChange={this.handleFormInputChange}
              placeholder="Title"
            />
            <input
              type="text"
              name="author"
              value={this.state.newUser.lastname}
              onChange={this.handleFormInputChange}
              placeholder="Author"
            />
            <input
              type="number"
              name="year"
              value={this.state.newUser.email}
              onChange={this.handleFormInputChange}
              placeholder="Year of Publication"
            />
            <input
              type="number"
              name="pages"
              value={this.state.newUser.phone}
              onChange={this.handleFormInputChange}
              placeholder="Number of Pages"
            />
            <input
              type="text"
              name="cover"
              value={this.state.newUser.ref_auth}
              onChange={this.handleFormInputChange}
              placeholder="ref_auth"
            />
            <button type="submit">Register</button>
          </form>
        </>
      );
    }
  }

  export default UserForm;