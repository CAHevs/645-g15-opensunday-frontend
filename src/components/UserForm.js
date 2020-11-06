import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter, Link, Route, Redirect, useHistory } from 'react-router-dom';
import {Formik, Field, Form } from 'formik';
import {useAuth0} from "@auth0/auth0-react";
import endpoints from "../endpoints.json";
import * as Yup from 'yup';
import TextField from '@material-ui/core/TextField';

//This function is used to register an user in our database
function UserForm() {

    //Const used to redirect at the end of the registeration
    const [registerDone, setregisterDone] = useState(false);

    //Const used for the formik with the initalValues
    const initialValues = {
        firstname: "",
        lastname: "",
        phone: ""
    };

    //Const used as the validation Schema for Formik with Yup
    const registerSchema = Yup.object().shape({
        firstname: Yup.string()
            .min(2, 'Too Short')
            .max(50, 'Too Long')
            .required('Required'),
        lastname: Yup.string()
            .min(2, 'Too Short')
            .max(50, 'Too Long')
            .required('Required'),
        phone: Yup.number()
            .test('len', 'Must be exactly 10', val => val.toString().length === 10)
            .required('Required'),
    })

    let {
        getAccessTokenSilently,
        user
    } = useAuth0();

    //Method called to add the user in the DB
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
                validationSchema={registerSchema}
                onSubmit={(values) => {
                    handleFormSubmit(values);
                }}>
                {({errors, touched}) =>(
                    <Form>
                        <br/>
                        <TextField
                            /* Link the created ref to the title input */
                            type="text"
                            name="firstname"
                            label="Firstname"
                            variant="outlined"
                        />{errors.firstname && touched.firstname ? (
                            <div>{errors.firstname}</div>
                    ) : null}
                        <br/>
                        <TextField
                            type="text"
                            name="lastname"
                            label="Lastname"
                            variant="outlined"
                        />
                        {errors.lastname && touched.lastname ? (
                            <div>{errors.lastname}</div>
                        ) : null}
                        <br/>
                        <TextField
                            type="number"
                            name="phone"
                            label="Phone number"
                            variant="outlined"
                        />
                        {errors.phone && touched.phone ? (
                            <div>{errors.phone}</div>
                        ) : null}
                        <br/><br/>
                        <button type="submit" >Register</button>
                        {registerDone ? <Redirect to="/" /> : null}
                    </Form>
                )}
            </Formik>
        </>
    );
}

export default UserForm;