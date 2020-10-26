import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter, Link, Route, Redirect } from 'react-router-dom';
import {Formik, Field, Form } from 'formik';
import {useAuth0} from "@auth0/auth0-react";
import endpoints from "./endpoints";
import request from "./utils/request";


function UserForm() {

    let [emptyUser, setemptyUser] = useState([]);
    let [newUser, setnewUser] = useState([]);

    const [registerDone, setregisterDone] = useState(false);

    const initialValues = {
        firstname: "",
        lastname: "",
        phone: ""
    };

    let {
        getAccessTokenSilently,
        user
    } = useAuth0();

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
        newUserToAdd = JSON.stringify(newUserToAdd);

        let path = process.env.REACT_APP_SERVER_URL + endpoints.user;

        let token = await getAccessTokenSilently();

        await newUserResponse(path, token, newUserToAdd);

        setregisterDone(true);
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
                    <button type="submit" >Register</button>
                    {registerDone ? <Redirect to="/" /> : null}
                </Form>
            </Formik>
        </>
    );
}

export default UserForm;