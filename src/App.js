import React, { useContext, useEffect, useState } from "react";
import "./App.css";
import { useAuth0 } from "@auth0/auth0-react";
import request from "./utils/request";
import endpoints from "./endpoints";
import Loading from "./components/Loading";
import { BrowserRouter, Link, Switch, Route, Redirect, useHistory } from "react-router-dom";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MaterialCore from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from "@material-ui/core/TextField";
import 'react-datepicker/dist/react-datepicker.css';
import ProtectedRoute from "./components/ProtectedRoute";
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import OpenMap from "./pages/OpenMap";
import UserForm from "./UserForm";
import LinearProgress from '@material-ui/core/LinearProgress';
import LocationsList from "./components/LocationsList";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import { UserContext } from "./utils/UserContext";
import Button from "@material-ui/core/Button";
import Modal from "react-bootstrap/Modal";
import {Field, Form, Formik} from "formik";
import * as Yup from "yup";
import ManageLocation from "./pages/ManageLocation";


function OpenSundayMap() {
    //Get the city from the user's localization
    let [cities, setCities] = useState([]);
    let [selectedCity, setselectedCity] = useState(null);
    let [locations, setLocations] = useState([]);
    let [isLoaded, setIsLoaded] = useState(false);
    const userContext = useContext(UserContext);
    let history = useHistory();
    let {
        getAccessTokenSilently,
        user,
    } = useAuth0();

    useEffect(() => {
        if(userContext.userAuthenticated === "notFound")
            history.push("/UserForm")
    }, [userContext.userAuthenticated])

    useEffect(() => {
        let getAllCities = async (e) => {
            let cities = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.city}`,
                getAccessTokenSilently
            );
            setCities(cities);
        }

        let getAllTypes = async (e) => {
            let types = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.type}`,
                getAccessTokenSilently
            );
            setTypes(types);
        }

        getAllCities().catch();
        getAllTypes().catch();

    }, []);
    useEffect(() => {
        async function fetchLocation() {
            setIsLoaded(false);
            let locations = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.location}`,
                getAccessTokenSilently)
            setLocations(locations);
            setIsLoaded(true);
        }
        fetchLocation().catch();
    }, []);

    /* Add Location and edit isCreator for the user */
    let [types, setTypes] = useState([]);
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
    const [showAddModal, setShowAddModal] = useState(false);
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
    let fetchLocations = async() => {
        locations = await request(`${process.env.REACT_APP_SERVER_URL}${endpoints.location}`,
            getAccessTokenSilently);
        setLocations(locations);
    }

    let handleClose = async () => {
        setShowAddModal(false);
        await fetchLocations();
    }

    let handleAddClick = () => {
        setShowAddModal(true);
    }

    let handleAddSubmit = async(values) => {

        let newLocation = values;

        if(values.id_Type == ""){
            newLocation["id_Type"] = 1;
        }else{
            newLocation["id_Type"] = parseInt(values.id_Type);
        }
        if(values.id_City == ""){
            newLocation["id_City"] = 1;
        }else {
            newLocation["id_City"] = parseInt(values.id_City);
        }

        newLocation["id_User"] = userContext.userAuthenticated.id;

        newLocation = JSON.stringify(newLocation);


        let path = process.env.REACT_APP_SERVER_URL + endpoints.location;

        let token = await getAccessTokenSilently();

        let response = await fetch(path, {
            method: 'POST',
            headers:{
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                'Content-Type': "application/json",

            },
            body: newLocation,
        });

        /*update isCreator for the user if not already isCreator*/
        if(userContext.userAuthenticated.isCreator === false){
            let currentUser = {};
            currentUser["id"] = userContext.userAuthenticated.id;
            currentUser["firstname"] = userContext.userAuthenticated.firstname;
            currentUser["lastname"] = userContext.userAuthenticated.lastname;
            currentUser["email"] = userContext.userAuthenticated.email;
            currentUser["phone"] = userContext.userAuthenticated.phone;
            currentUser["isCreator"] = true;
            currentUser["isBlocked"] = false;
            currentUser["ref_Auth"] = userContext.userAuthenticated.ref_auth;

            console.log(currentUser);

            let path = process.env.REACT_APP_SERVER_URL + endpoints.user + "/" + userContext.userAuthenticated.id;

            let token = await getAccessTokenSilently();

            let response = await fetch(path, {
                method: 'PUT',
                headers:{
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    'Content-Type': "application/json",

                },
                body: currentUser,
            });
        }
        await handleClose();
    }

    return (
        <>
            <div className="map-container">
                <div className="map-left">
                    <OpenMap locations={locations} positionUser={userContext.userPosition} />
                </div>

                <div className="locations-right">
                    <Button onClick={handleAddClick}>Add a new Location</Button>
                    <SimpleBar style={{maxHeight: "95%", height: "inherit"}}>
                        {isLoaded ? (<LocationsList locations={locations}/>) : <LinearProgress/>}
                    </SimpleBar>
                </div>
            </div>

            <Modal show={showAddModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add new location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik initialValues={initialValues}
                            validationSchema={addLocationSchema}
                            onSubmit={values => (handleAddSubmit(values))}
                    >
                        {({errors, touched}) => (
                            <Form>
                                <Field
                                    type="text"
                                    name="name"
                                    placeholder="Location name"
                                />
                                {errors.name && touched.name ? (
                                    <div>{errors.name}</div>
                                ): null}
                                <br/>
                                <Field
                                    type="text"
                                    name="address"
                                    placeholder="Address"
                                />
                                {errors.address && touched.address ? (
                                    <div>{errors.address}</div>
                                ): null}
                                <br/>
                                <Field as="select" name="id_Type">
                                    {types.map(type =>
                                        <option value={type.id}>{type.description}</option>
                                    )}
                                </Field>
                                <br/>
                                <Field
                                    type="text"
                                    name="url"
                                    placeholder="Url"
                                />
                                {errors.url && touched.url ? (
                                    <div>{errors.url}</div>
                                ): null}
                                <br/>
                                <Field
                                    type="number"
                                    name="lat"
                                    placeholder="Lat"
                                />
                                {errors.lat && touched.lat ? (
                                    <div>{errors.lat}</div>
                                ): null}
                                <br/>
                                <Field
                                    type="number"
                                    name="lng"
                                    placeholder="Lng"
                                />
                                {errors.lng && touched.lng ? (
                                    <div>{errors.lng}</div>
                                ): null}
                                <br/>
                                <Field as="select" name="id_City">
                                    {cities.map(city =>
                                        <option value={city.id}>{city.name}</option>
                                    )}
                                </Field><br/>
                                <button type="submit" >Create</button>
                            </Form>
                        )}

                    </Formik>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="contained" color="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

function App() {

    //Authentification with Auth0
    let {
        loading,
        loginWithRedirect,
        logout,
        isAuthenticated,
        getAccessTokenSilently,
        user
    } = useAuth0();

    let [isCreator, setisCreator] = useState(false);

    let userContext = useContext(UserContext);

    useEffect(() => {
        if(userContext.userAuthenticated === null) {
            return;
        }
        if(userContext.userAuthenticated.isCreator){
            setisCreator(true);
        }
    }, [userContext])

    useEffect(() => {
        async function fetchUser(){
            let response = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.user}/GetAuthenticatedUser/${user.sub}`,
                getAccessTokenSilently
            );

            if(response === 404){
                userContext.setUserAuthenticated("notFound");
                return;
            }
            userContext.setUserAuthenticated(response);
        }

        if(isAuthenticated){
            if(userContext.userAuthenticated == null){
                fetchUser().catch();
            }
        }

    }, [isAuthenticated]);



    //Login button with authentification
    let handleLoginClick = async (e) => {
        e.preventDefault();
        await loginWithRedirect();
    };

    let handleLogoutClick = async (e) => {
        e.preventDefault();
        userContext.setUserAuthenticated(null);
        logout({ returnTo: window.location.origin });
    };

    if (loading) {
        return <Loading />;
    }


    return (
        <BrowserRouter>
            <div className="App">
                <header>
                    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                        <Navbar.Brand href="/">Home Sunday</Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="mr-auto">
                                {userContext.userAuthenticated ? null : (
                                    <Nav.Link href="UserForm">Register</Nav.Link>
                                )}
                                {isCreator ? (
                                    <Nav.Link href="ManageLocation">Manage Locations</Nav.Link>
                                ) : null }
                            </Nav>
                            {isAuthenticated ? (
                                    /*If the user is authenticated*/
                                    <a
                                        className="App-link Logout-link"
                                        href="#"
                                        onClick={handleLogoutClick}
                                    >Logout
                                    </a>

                                ) :
                                //if the user isn't authenticated */
                                <a className="App-link Logout-link"
                                   href="#"
                                   onClick={handleLoginClick}
                                >Login
                                </a>
                            }

                        </Navbar.Collapse>
                    </Navbar>
                </header>
                <div className="App-body">
                    <Switch>
                        <Route exact path="/">
                            {isAuthenticated ? <OpenSundayMap/> : (
                                <div>
                                    <h1>Welcome to OpenSunday, please log in</h1>
                                    <button onClick={handleLoginClick}>Login</button>
                                </div>
                            )}
                        </Route>
                        <ProtectedRoute exact path="/UserForm" component={UserForm}/>
                        <ProtectedRoute exact path="/ManageLocation" component={ManageLocation}/>
                    </Switch>
                </div>
            </div>
        </BrowserRouter>
    );
}
export default App;