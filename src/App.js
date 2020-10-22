import React, {useContext, useEffect, useState} from "react";
import "./App.css";
import {useAuth0} from "@auth0/auth0-react";
import request from "./utils/request";
import endpoints from "./endpoints";
import Loading from "./components/Loading";
import {BrowserRouter, Link, Switch, Route, Redirect} from "react-router-dom";
import LocationDetails from "./pages/LocationDetails";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MaterialCore from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from "@material-ui/core/TextField";
import 'react-datepicker/dist/react-datepicker.css';
import ProtectedRoute from "./components/ProtectedRoute";
import {Navbar, Nav, NavDropdown} from 'react-bootstrap';
import OpenMap from "./pages/OpenMap";
import UserForm from "./UserForm";
import LinearProgress from '@material-ui/core/LinearProgress';
import LocationsList from "./components/LocationsList";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import {UserContext} from "./utils/UserContext";
import Button from "@material-ui/core/Button";
import ManageLocation from "./pages/ManageLocation";


let userAuth;

function OpenSundayMap() {

    let [locations, setLocations] = useState([]);
    let [isLoaded, setIsLoaded] = useState(false);

    let {
        loginWithRedirect,
        getAccessTokenSilently,
        user,
    } = useAuth0();

    useEffect(() => {
        async function fetchLocation() {

            await getLocation();
        }

        fetchLocation();
    }, []);

    let getLocation = async (e) => {
        setIsLoaded(false);
        let locations = await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.location}`,
            getAccessTokenSilently)
        setLocations(locations);
        setIsLoaded(true);
    }


    return (
        <>
            <div className="map-container">
                <div className="map-left">
                    <OpenMap locations={locations}/>
                </div>

                    <div className="locations-right">
                        <Button>Add a new Location</Button>
                        <SimpleBar style={{maxHeight: "100%"}}>
                        {isLoaded ? (<LocationsList locations={locations} user={userAuth}/>) : <LinearProgress/>}
                        </SimpleBar>
                    </div>
            </div>

        </>
    );
}

function Home() {
    let [selectedDate, setSelectedDate] = useState(null);
    //Get the city from the user's localization
    let [cities, setCities] = useState([]);
    let {
        loginWithRedirect,
        getAccessTokenSilently,
        user,
    } = useAuth0();

    const userContext = useContext(UserContext);

    useEffect(() => {
        async function fetchCities() {
            await getAllCities();
        }
        fetchCities();

    }, []);

    let getAllCities = async (e) => {
        let cities = await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.city}`,
            getAccessTokenSilently
        );
        setCities(cities);
    }

    return (
        <>
            <h1>Welcome, login then select a town and a date</h1>

            <Autocomplete
                freeSolo
                id="combo-box"
                options={cities}
                getOptionLabel={(city) => city.name}
                style={{width: 300}}
                renderInput={(params) => <TextField {...params} label="City" variant="outlined"/>}
            />


            <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                filterDate={date => date.getDay() == 0}
                //filterDate={sunHolidDays}
                minDate={new Date()}
                placeholderText="Select a sunday or holiday"
            />
            {}
            <ul className="Map">
                <Link
                    className="App-Map"
                    to="/Map">
                    <button>
                        map me
                    </button>

                </Link>
            </ul>
        </>
    );
}


function App() {

    //Authentification with Auth0
    let {
        loading,
        loginWithRedirect,
        logout,
        getAccessTokenSilently,
        isAuthenticated,
        user,
    } = useAuth0();

    let userContext = useContext(UserContext);

    //Get the city from the user's localization
    navigator.geolocation.getCurrentPosition(function (position) {
        console.log("Latitude is : ", position.coords.latitude);
        console.log("Longitude is : ", position.coords.longitude);
    });

    let getUser = () =>{
        userContext.userAuthenticated = "notFound";
        checkAuthentication().catch();
    }
    let checkAuthentication = async () => {
        userContext.userAuthenticated = await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.user}/GetAuthenticatedUser/${user.sub}`,
            getAccessTokenSilently
        );
        console.log("My User Context :" + userContext.userAuthenticated);
    }

    //Login button with authentification
    let handleLoginClick = async (e) => {
        e.preventDefault();
        await loginWithRedirect();
    };

    let handleLogoutClick = async (e) => {
        e.preventDefault();
        /*
    returnTo parameter is necessary because multiple apps use the same authentication backend
    */
        logout({returnTo: window.location.origin});
    };

    if (loading) {
        return <Loading/>;
    }

    let handleFormSubmit = async (e) => {
        console.log("map me")
    }

    let findNearMe = async (e) => {

    }

    return (
        <BrowserRouter>
            <div className="App">
                <header>
                    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                        <Navbar.Brand href="/">Home Sunday</Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="mr-auto">
                                <Nav.Link href="Map">Map</Nav.Link>
                                <Nav.Link href="UserForm">Register</Nav.Link>
                                <NavDropdown title="Dropdown" id="collasible-nav-dropdown">
                                    <NavDropdown.Item href="ManageLocation">Manage Locations</NavDropdown.Item>
                                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                                    <NavDropdown.Divider/>
                                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                                </NavDropdown>
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
                            {isAuthenticated ? <Home/> : (
                                <div>
                                    <h1>Welcome to OpenSunday, please log in</h1>
                                    <button onClick={handleLoginClick}>Login</button>
                                </div>
                            )}
                            {isAuthenticated && userContext.userAuthenticated===null ? getUser():null}
                        </Route>
                        <Route exact path="/Map" component={OpenSundayMap}/>
                        <Route exact path="/UserForm" component={UserForm}/>
                        <Route exact path="/ManageLocation" component={ManageLocation}/>
                    </Switch>
                </div>
            </div>
        </BrowserRouter>
    );
}
export default App;

