import React, {useContext, useEffect, useState} from 'react';
import {Redirect, useHistory} from 'react-router-dom';
import {Formik} from 'formik';
import Form from "react-bootstrap/Form";
import {useAuth0} from "@auth0/auth0-react";
import endpoints from "../endpoints.json";
import * as Yup from 'yup';
import Button from "@material-ui/core/Button";
import postRequest from "../utils/postRequest";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import {UserContext} from "../utils/UserContext";

//This function is used to register an user in our database
function UserForm() {
    //Const used to redirect at the end of the registeration
    const [registerDone, setregisterDone] = useState(false);

    let {
        getAccessTokenSilently,
        user
    } = useAuth0();

    let userContext = useContext(UserContext);
    let history = useHistory();

    useEffect(()=>{
        if(userContext.userAuthenticated !== "notFound"){
            history.push("/");
        }
    }, [userContext]);

    //Const used as the validation Schema for Formik with Yup
    const registerSchema = Yup.object({
        Firstname: Yup.string()
            .min(2)
            .max(50)
            .required(),
        Lastname: Yup.string()
            .min(2)
            .max(50)
            .required(),
        Phone: Yup.string().matches(/^[0-9]*$/, 'Only numbers please'),
    });


    /* Form submission handler */
    const handleFormSubmit = async (newValues) => {
        /* Prevent the form submission from reloading the page */
        /* Get the response body, parsed from JSON */
        let newUserResponse = await postRequest(`${process.env.REACT_APP_SERVER_URL}${endpoints.user}`,
            getAccessTokenSilently, JSON.stringify(newValues));

        //Set the new user to the user context
        userContext.setUserAuthenticated(newUserResponse);
        setregisterDone(true);
    };


    return (
        <>
            <Paper style={{padding: "4em", marginTop: "2em"}}>

                <h2>Please register yourself !</h2>
                <Divider/>
                <Formik
                    initialValues={{
                        Firstname: "",
                        Lastname: "",
                        Phone: "",
                        Ref_auth: user.sub,
                        Email: user.email
                    }}
                    validationSchema={registerSchema}
                    onSubmit={(values) => handleFormSubmit(values)}>
                    {({
                          errors, touched,
                          handleSubmit,
                          values,
                          handleChange,
                          handleBlur
                      }) => (
                        <Form>
                            <Form.Label style={{alignItems:"flex-start"}}>
                                <Typography>Firstname*</Typography>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={values.Firstname}
                                isInvalid={!!errors.Firstname}
                                onBlur={handleBlur('Firstname')}
                                onChange={handleChange('Firstname')}
                                placeholder="Your firstname"
                            />
                            <Form.Control.Feedback type="invalid">
                                <Typography>{errors.Firstname}</Typography>
                            </Form.Control.Feedback>
                            <Form.Label>
                                <Typography>Lastname*</Typography>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                variant="outlined"
                                value={values.Lastname}
                                isInvalid={!!errors.Lastname}
                                onChange={handleChange('Lastname')}
                                onBlur={handleBlur('Lastname')}
                                placeholder="Your lastname"
                            />
                            <Form.Control.Feedback type="invalid">
                                <Typography>{errors.Lastname}</Typography>
                            </Form.Control.Feedback>
                            <Form.Label>
                                <Typography>Phone Number</Typography>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={values.Phone}
                                isInvalid={!!errors.Phone}
                                onChange={handleChange('Phone')}
                                onBlur={handleBlur('Phone')}
                                placeholder="Only numbers"/>
                            <Form.Control.Feedback type="invalid">
                                <Typography>{errors.Phone}</Typography>
                            </Form.Control.Feedback>
                            <Button variant="contained" color="primary" onClick={handleSubmit}>Register</Button>
                            {registerDone ? <Redirect to="/"/> : null}
                        </Form>

                    )}
                </Formik>
            </Paper>
        </>
    );
}

export default UserForm;