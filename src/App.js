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

        getAllCities().catch();

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


    return (
        <>
            <div className="map-container">
                <div className="map-left">
                    <OpenMap locations={locations} positionUser={userContext.userPosition} cities={cities} />
                </div>

                    <div className="locations-right">
                        <Button>Add a new Location</Button>
                        <SimpleBar style={{maxHeight: "95%", height: "inherit"}}>
                        {isLoaded ? (<LocationsList locations={locations}/>) : <LinearProgress/>}
                        </SimpleBar>
                    </div>
            </div>
        </>
    );
}

/*function Home() {
    let {
        loginWithRedirect,
        getAccessTokenSilently,
        user,
    } = useAuth0();
    const userContext = useContext(UserContext);
    //Get the location (latitude/longitude and the town)from the user's machine
    //Get all the cities from the server
    return (
        <>
            <h1>Welcome, select a town and a date</h1>
            <Autocomplete
                freeSolo
                id="combo-box"
                options={cities}
                getOptionLabel={(city) => city.name}
                style={{ width: 300 }}
                getOptionSelected={selectedCity}
                onChange={setselectedCity}
                renderInput={(params) => <TextField {...params} label="City" variant="outlined" />}
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
}*/


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

    let userContext = useContext(UserContext);

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
                                <Nav.Link href="UserForm">Register</Nav.Link>
                                <NavDropdown title="Dropdown" id="collasible-nav-dropdown">
                                    <NavDropdown.Item href="ManageLocation">Manage Locations</NavDropdown.Item>
                                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                                    <NavDropdown.Divider />
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