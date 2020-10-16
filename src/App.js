import React, {useEffect, useState} from "react";
import "./App.css";
import {useAuth0} from "@auth0/auth0-react";
import request from "./utils/request";
import endpoints from "./endpoints";
import Loading from "./components/Loading";
import {BrowserRouter, Link, Switch, Route, Redirect} from "react-router-dom";
import LocationDetails from "./pages/LocationDetails";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
import UserForm from "./UserForm";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'

let userAuthenticated;

class LocationsList extends React.Component {
  constructor(props) {
    super(props);

    const names = ['Bruce','Alex','Tiago','Lee','Christopher Arteroz my love','mon amoureuse chérie']
    return (
      <div>
        {names.map(name => <h2>{name}</h2>)}
      </div>
    )
  }
}

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


    return (
      <div className="map-container">
        <div className="map-left">
          <OpenSundayMap />
        </div>
        <div className="locations-right">
          {/* <LocationsList /> */}
         
        </div>
      </div>
    );
  
};

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


  let checkAuthentication = async (e) => {
    userAuthenticated = await request(
      `${process.env.REACT_APP_SERVER_URL}${endpoints.user}/getauthenticateduser/${user.sub}`,
      getAccessTokenSilently,
      loginWithRedirect);

    setLocations(await request(
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
    <div className="App">
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="/">Home Sunday</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="Map">Map</Nav.Link>
            <Nav.Link href="UserForm">Register</Nav.Link>
            <NavDropdown title="Dropdown" id="collasible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
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

      <BrowserRouter>
        <header className="App-header">
        </header>
        <div className="App-body">
          <Switch>
            <Route exact path="/" component={Home} />
            <ProtectedRoute path="/Map" component={OpenSundayMap} />
            <ProtectedRoute exact path="/UserForm" component={UserForm} />
          </Switch>
        </div>
      </BrowserRouter>

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
        </div>
    );
}
    }

export default App;
