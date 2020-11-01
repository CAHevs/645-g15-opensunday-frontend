import React, {useContext, useEffect, useState} from "react";
import "./App.css";
import {useAuth0} from "@auth0/auth0-react";
import request from "./utils/request";
import endpoints from "./endpoints";
import Loading from "./components/Loading";
import {BrowserRouter, Link, Switch, Route, Redirect, useHistory, useParams, NavLink} from "react-router-dom";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MaterialCore from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from "@material-ui/core/TextField";
import 'react-datepicker/dist/react-datepicker.css';
import ProtectedRoute from "./components/ProtectedRoute";
import {Navbar, Nav, NavDropdown} from 'react-bootstrap';
import OpenMap from "./pages/OpenMap";
import UserForm from "./components/UserForm";
import LinearProgress from '@material-ui/core/LinearProgress';
import LocationsList from "./components/LocationsList";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import {UserContext} from "./utils/UserContext";
import Button from "@material-ui/core/Button";
import Modal from "react-bootstrap/Modal";
import {Field, Form, Formik} from "formik";
import * as Yup from "yup";
import ManageLocation from "./pages/ManageLocation";
import AddLocationModal from "./components/AddLocationModal";
import CircularProgress from '@material-ui/core/CircularProgress';
import Skeleton from "@material-ui/lab/Skeleton";


function OpenSundayMap() {
    //Get the city from the user's localization
    let [cities, setCities] = useState([]);
    let [selectedCity, setselectedCity] = useState(null);
    let [locations, setLocations] = useState([]);
    let [isLoaded, setIsLoaded] = useState(false);
    let [showAddModal, setShowAddModal] = useState(false);

    const userContext = useContext(UserContext);
    let history = useHistory();

    let {
        getAccessTokenSilently,
    } = useAuth0();

    useEffect(() => {
        if (userContext.userAuthenticated === "notFound")
            history.push("/UserForm")
    }, [userContext.userAuthenticated]);

    useEffect(() => {
        async function fetchLocation() {
            setIsLoaded(false);
            let locations = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.location}`,
                getAccessTokenSilently)
            setLocations(locations);
            setIsLoaded(true);
        }

        let getAllCities = async (e) => {
            let cities = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.city}`,
                getAccessTokenSilently
            );
            setCities(cities);
        }
        getAllCities().catch();
        fetchLocation().catch();
    }, []);

    let handleClose = async () => {
        setShowAddModal(false);
    }


    let handleAddClick = () => {
        setShowAddModal(true);
    }

    return (
        <>
            <div className="map-container">
                <div className="map-left">
                    {locations.length === 0 ? <Skeleton variant="rect" style={{height: "100vh", width: "100%"}} />
                    : <OpenMap locations={locations}
                               cities={cities}
                               positionUser={userContext.userPosition}
                        />}
                </div>

                <div className="locations-right">
                    <Button onClick={handleAddClick}>Add a new Location</Button>
                    <SimpleBar style={{maxHeight: "95%", height: "inherit"}}>
                        {isLoaded ? (<LocationsList locations={locations}/>)
                            : <LinearProgress/>}
                    </SimpleBar>
                </div>
            </div>

            {showAddModal ? <AddLocationModal showAddModal={showAddModal} handleClose={handleClose} cities={cities}/> : null}
        </>
    );
}

function App() {

    let [currentUser, setCurrentUser] = useState(null);

    //Authentification with Auth0
    let {
        loading,
        loginWithRedirect,
        logout,
        isAuthenticated,
        getAccessTokenSilently,
        user
    } = useAuth0();

    let [isCreator, setIsCreator] = useState(false);

    let userContext = useContext(UserContext);

    useEffect(() => {
        if(userContext.userAuthenticated === null) {
            return;
        }

        if(userContext.userAuthenticated.isCreator){
            setIsCreator(true);
        }
        setCurrentUser(userContext.userAuthenticated);
    }, [userContext])

    useEffect(() => {
        async function fetchUser() {
            let response = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.user}/GetAuthenticatedUser/${user.sub}`,
                getAccessTokenSilently
            );
            if (response === 404) {
                userContext.setUserAuthenticated("notFound");
                return;
            }
            userContext.setUserAuthenticated(response);
        }

        if (isAuthenticated) {
            if (userContext.userAuthenticated == null) {
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
        logout({returnTo: window.location.origin});
    };

    if (loading) {
        return <Loading/>;
    }


    return (

        <BrowserRouter>
            <div className="App">
                <header>
                    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                        <Navbar.Brand href="/">OpenSunday</Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="mr-auto">
                                {userContext.userAuthenticated ? null : (
                                    <NavLink to="/UserForm" className="navLinks">Register</NavLink>
                                )}
                                {isCreator ? (
                                    <NavLink to="/ManageLocation" className="navLinks">Manage Locations</NavLink>
                                ) : null }
                            </Nav>
                            {isAuthenticated ? (
                                    /*If the user is authenticated*/
                                    <a
                                        className="App-link Logout-link navLinks"
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
                                    <Button  variant="contained" color="primary" onClick={handleLoginClick}>Login</Button>
                                </div>
                            )}
                        </Route>
                        <Route exact path="/location/:locationId" >
                            {isAuthenticated ? <OpenSundayMap/> : (
                                <div>
                                    <h1>Welcome to OpenSunday, please log in</h1>
                                    <Button  variant="contained" color="primary" onClick={handleLoginClick}>Login</Button>
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