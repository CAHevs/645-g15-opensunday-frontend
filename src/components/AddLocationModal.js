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
import Label from '@material-ui/core/InputLabel';
import {useSnackbar} from "notistack";
import putRequest from "../utils/putRequest";

//Function that will be called to show a Modal Form for adding a new location
export default function AddLocationModal(props) {
    let showAddModal = props.showAddModal;
    let handleClose = props.handleClose;
    let cities = props.cities;

    let userContext = useContext(UserContext);
    const {enqueueSnackbar} = useSnackbar();

    let {
        getAccessTokenSilently,
        user,
    } = useAuth0();

    let [types, setTypes] = useState([]);

    //This useEffect will get all the types
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

    //Const with all the initialValues that will be used in Formik
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

    //Const Schema used for the validation of the Formik Form by Yup
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

    //Method that will be called after the formik will be submited
    //We parse all the int and float because we receive all values as String
    let handleAddSubmit = async (values) => {

        let newLocation = values;

        newLocation["lat"] = parseFloat(newLocation["lat"]);
        newLocation["lng"] = parseFloat(newLocation["lng"]);

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

        //Post the new Location to the DB
        let response = await fetch(path, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                'Content-Type': "application/json",

            },
            body: newLocation,
        });
        if (userContext.userAuthenticated.isCreator === false) {
            let currentUser = userContext.userAuthenticated;
            currentUser.isCreator = true;
            let responseUser = await putRequest(`${process.env.REACT_APP_SERVER_UR}${endpoints.user}/${userContext.userAuthenticated.id}`,
                getAccessTokenSilently, JSON.stringify(currentUser));
            userContext.setUserAuthenticated(currentUser);
        }
        if (response === 409) {
            enqueueSnackbar('This location already exists.', {variant: 'error'});
        } else {
            enqueueSnackbar("Location successfully added", {variant: 'success'});
        }
        await handleClose();
    }

    //Const for the Field As Select
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
                                <Label>Location Name</Label>
                                <Field
                                    type="text"
                                    name="name"
                                    label="Location name"
                                    variant="outlined"
                                    margin="dense"
                                    render={({field}) => <TextField {...field} />}
                                />
                                {errors.name && touched.name ? (
                                    <div>{errors.name}</div>
                                ) : null}
                                <br/>
                                <Label style={{paddingTop: '10px'}}>Address</Label>
                                <Field
                                    type="text"
                                    name="address"
                                    label="Address"
                                    variant="outlined"
                                    render={({field}) => <TextField {...field} />}
                                />
                                {errors.address && touched.address ? (
                                    <div>{errors.address}</div>
                                ) : null}
                                <br/>
                                <Label style={{paddingTop: '10px'}}>Type</Label>
                                <Field as="select" name="id_Type" style={fieldSelectStyle}>
                                    {types.map(type =>
                                        <option key={type.id} value={type.id}>{type.description}</option>
                                    )}
                                </Field>
                                <br/>
                                <Label style={{paddingTop: '10px'}}>URL</Label>
                                <Field
                                    type="text"
                                    name="url"
                                    label="Url"
                                    variant="outlined"
                                    render={({field}) => <TextField {...field} />}
                                />
                                {errors.url && touched.url ? (
                                    <div>{errors.url}</div>
                                ) : null}
                                <br/>
                                <Label style={{paddingTop: '10px'}}>LAT</Label>
                                <Field
                                    type="number"
                                    name="lat"
                                    label="Lat"
                                    variant="outlined"
                                    render={({field}) => <TextField {...field} />}
                                />
                                {errors.lat && touched.lat ? (
                                    <div>{errors.lat}</div>
                                ) : null}
                                <br/>
                                <Label style={{paddingTop: '10px'}}>LNG</Label>
                                <Field
                                    type="number"
                                    name="lng"
                                    label="Lng"
                                    variant="outlined"
                                    render={({field}) => <TextField {...field} />}
                                />
                                {errors.lng && touched.lng ? (
                                    <div>{errors.lng}</div>
                                ) : null}
                                <br/>
                                <Label style={{paddingTop: '10px'}}>City</Label>
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