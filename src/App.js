import React, {useEffect, useState} from "react";
import "./App.css";
import {useAuth0} from "@auth0/auth0-react";
import request from "./utils/request";
import endpoints from "./endpoints";
import Loading from "./components/Loading";
import {BrowserRouter, Link, Switch, Route, Redirect} from "react-router-dom";
import LocationDetails from "./pages/LocationDetails";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import UserForm from "./UserForm"
import MaterialCore from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from "@material-ui/core/TextField";

function App() {
    let [locations, setLocations] = useState([]);

    let [userAuthenticated, setUserAuthenticated] = useState([]);

    let [cities, setCities] = useState([]);

    const [selectedDate, setSelectedDate] = useState(null);

    //Authentification with Auth0
    let {
        loading,
        loginWithRedirect,
        logout,
        getAccessTokenSilently,
        isAuthenticated,
        user,
    } = useAuth0();

    useEffect(() => {
        async function fetchCities() {
            await getAllCities();
        }

        async function fetchAuthenticatedUser(){
            await checkAuthentication();
        }

        fetchCities();

    }, [])

    //Get the city from the user's localization
    navigator.geolocation.getCurrentPosition(function(position){
        console.log("Latitude is : ", position.coords.latitude);
        console.log("Longitude is : ", position.coords.longitude);
    });

    let checkAuthentication = async (e) => {
        setUserAuthenticated(await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.user}/GetAuthenticatedUser/${user.sub}`,
            getAccessTokenSilently,
            loginWithRedirect
            )
        )
    }

    //Login button with authentification
    let handleLoginClick = async (e) => {
        e.preventDefault();
        await loginWithRedirect();
        await checkAuthentication();
    };

    let getAllCities = async (e) => {

        let cities = await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.city}`,
            getAccessTokenSilently,
            loginWithRedirect
        );
        setCities(cities)
    }

    function AutoCompleteCity() {
        return (
            <>
                <Autocomplete
                    freeSolo
                    id="combo-box-demo"
                    options={cities}
                    getOptionLabel={(city) => city.name}
                    style={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="City" variant="outlined" />}
                />
                {//cities.length > 0 &&
            //    <select>
            //        {cities.map(city => (
             //           <option key={city.id} value={city.id}>{city.name} {city.code}</option>
             //       ))}
             //   </select>
                }</>
        )
    }

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
        <div className="App">
            <header className="App-header">
                {userAuthenticated  ? (
                        /*If the user is authenticated*/
                        <a
                            className="App-link Logout-link"
                            href="#"
                            onClick={handleLogoutClick}
                        >Logout
                        </a>

                    ) :
                    /*if the user isn't authenticated */
                    <a className="App-link Logout-link"
                       href="#"
                       onClick={handleLoginClick}
                    >Login
                    </a>
                }


            </header>
            <body className="App-body">
            <h1>Welcome, login then select a town and a date</h1>

            {userAuthenticated && <>
                <AutoCompleteCity/>


                <DatePicker
                    selected={selectedDate}
                    onChange={date => setSelectedDate(date)}
                    filterDate={date => date.getDay() == 0}
                    //filterDate={sunHolidDays}
                    minDate={new Date()}
                    placeholderText="Select a sunday or holiday"
                />
            </>
            }


            <BrowserRouter>
                <Switch>
                    <Route
                        path="/"
                        exact
                        render={() => (
                            <>
                                {/* user != null
                                ici on vérifie que le user exite dans notre db */}
                                {userAuthenticated ? (
                                        <ul className="Map">
                                            <Link
                                                className="App-Map"
                                                to="/Map"
                                                //onClick={}
                                            >
                                                <button onClick={handleFormSubmit}>
                                                    {userAuthenticated} map me
                                                </button>

                                                <button onClick={findNearMe}>
                                                    {userAuthenticated} Near me
                                                </button>

                                            </Link>
                                        </ul>
                                    ) :
                                    (
                                        <>
                                            <Route path="/newUser"/>
                                            <UserForm/>
                                        </>

                                    )}
                            </>
                        )}
                    />

                </Switch>
            </BrowserRouter>
            </body>
        </div>
    );
}

export default App;
