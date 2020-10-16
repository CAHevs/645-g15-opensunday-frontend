import React, { useState } from "react";
import "./App.css";
import { useAuth0 } from "@auth0/auth0-react";
import request from "./utils/request";
import endpoints from "./endpoints";
import Loading from "./components/Loading";
import {BrowserRouter, Link, Switch, Route} from "react-router-dom";
//import LocationDetails from "./pages/LocationDetails";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
import UserForm from "./UserForm";
//import UserForm from "./UserForm"

let userAuthenticated;


class LocationsList extends React.Component {
    constructor(props) {
        super(props);
    }
}


class OpenSundayMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate : null,
        }
    }

    render() {
        return (
            <>
                <h1>{}</h1>
            </>
        );
    }
}
class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate : null,
        }
    }
    //Get the city from the user's localization
    city = "Sion";

    render() {
        return (
            <>
                <h1>Welcome, login then select a town and a date</h1>

                <input
                    //fieldRef={this.titleInputRef}
                    type="text"
                    name="city"
                    value={this.city}
                    // onChange={this.handleFormChange}
                    //placeholder="Title"
                >
                </input>


                <DatePicker
                    selected={this.state.selectedDate}
                    onChange={this.state.selectedDate = this.date}
                    filterDate={date => date.getDay() == 0}
                    //filterDate={sunHolidDays}
                    minDate={new Date()}
                    placeholderText="Select a sunday or holiday"
                />
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
}


function App() {
    let [locations, setLocations] = useState([]);

    //Authentification with Auth0
    let {
        loading,
        loginWithRedirect,
        logout,
        getAccessTokenSilently,
        isAuthenticated,
        user,
    } = useAuth0();


    let checkAuthentication = async(e) => {
        userAuthenticated = await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.user}/getauthenticateduser/${user.sub}`,
            getAccessTokenSilently,
            loginWithRedirect);

        setLocations( await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.location}`,
            getAccessTokenSilently,
            loginWithRedirect
        ));

    }



    //Login button with authentification
    let handleLoginClick = async (e) => {
        e.preventDefault();
        await loginWithRedirect();
        await checkAuthentication();

    };

    let handleLogoutClick = async (e) => {
        e.preventDefault();
        /*
        returnTo parameter is necessary because multiple apps use the same authentication backend
        */
        logout({ returnTo: window.location.origin });
    };

    if (loading) {
        return <Loading />;
    }



    return (
        <BrowserRouter>
            <header className="App-header">
                {isAuthenticated ? (
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
            <div className="App-body">
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route exact path="/Map" component={OpenSundayMap}/>
                    <Route exact path="/UserForm" component={UserForm}/>
                </Switch>
            </div>
        </BrowserRouter>
    );
}

export default App;