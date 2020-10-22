import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import {Formik, Field, Form } from 'formik';
import {useAuth0} from "@auth0/auth0-react";
import endpoints from "./endpoints";
import request from "./utils/request";


function UserForm() {

    let [emptyUser, setemptyUser] = useState([]);
    let [newUser, setnewUser] = useState([]);

    const initialValues = {
        firstname: "",
        lastname: "",
        phone: ""
    };

    let {
        loginWithRedirect,
        getAccessTokenSilently,
        user
    } = useAuth0();

    emptyUser = {firstname: '', lastname: '', email: '', phone: '', isCreator: false, ref_auth: ''};
  
    /* Form input change handler */
    let handleFormInputChange = (event) => {

        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState((prevState) => ({
            newUser: { ...prevState.newUser, [name]: value },
        }));
    };

    let newUserResponse = async(path, token, newUserToAdd) =>{
        let response = fetch(path, {
            method: 'POST',
            headers:{
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                'Content-Type': "application/json",

            },
            body: newUserToAdd,
        });
    };
  
    /* Form submission handler */
    let handleFormSubmit = async (newValues) => {
        /* Prevent the form submission from reloading the page */

        /* Get the response body, parsed from JSON */
        //let newUser = this.emptyUser;
        let phoneNumber = newValues.phone.toString();

        let newUserToAdd = newValues;
        newUserToAdd["phone"] = phoneNumber;
        let ref_auth = user.sub;
        let email = user.email;
        newUserToAdd["email"] = email;
        newUserToAdd["ref_auth"] = ref_auth;
        console.log(newUserToAdd)
        newUserToAdd = JSON.stringify(newUserToAdd);
        console.log(newUserToAdd);

        let path = process.env.REACT_APP_SERVER_URL + endpoints.user;

        let token = await getAccessTokenSilently();

        await newUserResponse(path, token, newUserToAdd);
    };

    return (
        <>
            {/* Render a form allowing to add a new book to the list */}
            <h2>Register yourself !</h2>
            <Formik
                initialValues={initialValues}
                onSubmit={(values) => {
                    handleFormSubmit(values);
                }}>
                <Form>
                    <Field
                        /* Link the created ref to the title input */
                        type="text"
                        name="firstname"
                        //value={this.state.newUser.firstname}
                        //onChange={handleFormInputChange}
                        placeholder="Firstname"
                    /><br/>
                    <Field
                        type="text"
                        name="lastname"
                        //value={values.lastname}
                        //onChange={handleFormInputChange}
                        placeholder="Lastname"
                    /><br/>
                    <Field
                        type="number"
                        name="phone"
                        //value={this.state.newUser.phone}
                        //onChange={handleFormInputChange}
                        placeholder="Phone number"
                    /><br/>
                    <button type="submit">Register</button>
                </Form>
            </Formik>
        </>
    );
}

export default UserForm;