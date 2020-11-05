import Modal from "react-bootstrap/Modal";
import {Field, Form, Formik} from "formik";
import Button from "@material-ui/core/Button";
import React, {useContext, useEffect, useState} from "react";
import endpoints from "../endpoints.json";
import {UserContext} from "../utils/UserContext";
import * as Yup from "yup";
import request from "../utils/request";
import {useAuth0} from "@auth0/auth0-react";
import TextField from '@material-ui/core/TextField';


export default function AddLocationModal(props) {
    let showAddModal = props.showAddModal;
    let handleClose = props.handleClose;
    let cities = props.cities;

    let userContext = useContext(UserContext);

    let {
        getAccessTokenSilently,
        user,
    } = useAuth0();

    /* Add Location and edit isCreator for the user */
    let [types, setTypes] = useState([]);

    useEffect(() => {
        let getAllTypes = async (e) => {
            let types = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.type}`,
                getAccessTokenSilently
            );
            setTypes(types);
        }
        getAllTypes().catch();
    }, [])


    const initialValues = {
        name: "",
        address: "",
        id_Type: "",
        url: "",
        id_City: "",
        lat: "",
        lng: "",
        id_User: ""
    };

    const addLocationSchema = Yup.object().shape({
        name: Yup.string()
            .min(2, 'Too Short')
            .max(50, 'Too Long')
            .required('Required'),
        address: Yup.string()
            .min(2, 'Too Short')
            .max(50, 'Too Long')
            .required('Required'),
        url: Yup.string()
            .min(5, 'Too Short')
            .max(250, 'Too Long')
            .required('Required'),
        lat: Yup.number()
            .required('Required'),
        lng: Yup.number()
            .required('Required')
    })

    let handleAddSubmit = async (values) => {
        console.log('values', values);

        let newLocation = values;

        if (values.id_Type == "") {
            newLocation["id_Type"] = 1;
        } else {
            newLocation["id_Type"] = parseInt(values.id_Type);
        }
        if (values.id_City == "") {
            newLocation["id_City"] = 1;
        } else {
            newLocation["id_City"] = parseInt(values.id_City);
        }

        newLocation["id_User"] = userContext.userAuthenticated.id;

        newLocation = JSON.stringify(newLocation);


        let path = process.env.REACT_APP_SERVER_URL + endpoints.location;

        let token = await getAccessTokenSilently();

        let response = await fetch(path, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                'Content-Type': "application/json",

            },
            body: newLocation,
        });

        /*update isCreator for the user if not already isCreator*/
        if (userContext.userAuthenticated.isCreator === false) {
            let currentUser = {};
            currentUser["id"] = userContext.userAuthenticated.id;
            currentUser["firstname"] = userContext.userAuthenticated.firstname;
            currentUser["lastname"] = userContext.userAuthenticated.lastname;
            currentUser["email"] = userContext.userAuthenticated.email;
            currentUser["phone"] = userContext.userAuthenticated.phone;
            currentUser["isCreator"] = true;
            currentUser["isBlocked"] = false;
            currentUser["ref_Auth"] = userContext.userAuthenticated.ref_auth;


            let path = process.env.REACT_APP_SERVER_URL + endpoints.user + "/" + userContext.userAuthenticated.id;

            let token = await getAccessTokenSilently();

            let response = await fetch(path, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    'Content-Type': "application/json",

                },
                body: currentUser,
            });
        }
        await handleClose();
    }

    const fieldSelectStyle = {
        border: 'none',
        width: '24.5ch',
        paddingTop: '20px',
        paddingBottom: '20px'
    }

    return (
        <>

            <Modal show={showAddModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add new location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik initialValues={initialValues}
                            validationSchema={addLocationSchema}
                            onSubmit={values => (handleAddSubmit(values))}
                    >
                        {({errors, touched, handleSubmit}) => (

                            <Form>
                                <TextField
                                    type="text"
                                    name="name"
                                    label="Location name"
                                    variant="outlined"
                                />
                                {errors.name && touched.name ? (
                                    <div>{errors.name}</div>
                                ) : null}
                                <br/>
                                <TextField
                                    type="text"
                                    name="address"
                                    label="Address"
                                    variant="outlined"
                                />
                                {errors.address && touched.address ? (
                                    <div>{errors.address}</div>
                                ) : null}
                                <br/>
                                <Field as="select" name="id_Type" style={fieldSelectStyle}>
                                    {types.map(type =>
                                        <option key={type.id} value={type.id}>{type.description}</option>
                                    )}
                                </Field>
                                <br/>
                                <TextField
                                    type="text"
                                    name="url"
                                    label="Url"
                                    variant="outlined"
                                />
                                {errors.url && touched.url ? (
                                    <div>{errors.url}</div>
                                ) : null}
                                <br/>
                                <TextField
                                    type="number"
                                    name="lat"
                                    label="Lat"
                                    variant="outlined"
                                />
                                {errors.lat && touched.lat ? (
                                    <div>{errors.lat}</div>
                                ) : null}
                                <br/>
                                <TextField
                                    type="number"
                                    name="lng"
                                    label="Lng"
                                    variant="outlined"
                                />
                                {errors.lng && touched.lng ? (
                                    <div>{errors.lng}</div>
                                ) : null}
                                <br/>
                                <Field as="select" name="id_City" style={fieldSelectStyle}>
                                    {cities.map(city =>
                                        <option key={city.id} value={city.id}>{city.name}</option>
                                    )}
                                </Field><br/>
                                <Button variant="contained" color="primary" type="submit">
                                    Create Location
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="contained" color="secondary" onClick={handleClose}
                            style={{marginRight: "0.2em"}}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}