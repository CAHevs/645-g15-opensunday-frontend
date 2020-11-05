import React, {useContext, useEffect, useState} from "react";
import "./App.css";
import {useAuth0} from "@auth0/auth0-react";
import request from "./utils/request";
import endpoints from "./endpoints";
import Loading from "./components/Loading";
import {BrowserRouter, Switch, Route, useHistory, NavLink} from "react-router-dom";
import 'react-datepicker/dist/react-datepicker.css';
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
import ManageLocation from "./pages/ManageLocation";
import AddLocationModal from "./components/AddLocationModal";
import Skeleton from "@material-ui/lab/Skeleton";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import CheckBox from "@material-ui/core/Checkbox";
import Administrator from "./pages/Administrator";


function OpenSundayMap() {
    //Get the city from the user's localization
    let [cities, setCities] = useState([]);
    let [locations, setLocations] = useState([]);
    let [filteredLocationsByCity, setFilteredLocationsByCity] = useState([]);
    let [isLoaded, setIsLoaded] = useState(false);
    let [showAddModal, setShowAddModal] = useState(false);
    let [cityChoosed, setCityChoosed] = useState(null);
    let [types, setTypes] = useState([]);

    const userContext = useContext(UserContext);
    const [anchorEl, setAnchorEl] = useState(null);
    let [selectedFilter, setSelectedFilter] = useState([]);
    let history = useHistory();
    let [filteredLocations, setFilteredLocations] = useState([]);
    let {
        getAccessTokenSilently,
        user,
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
                getAccessTokenSilently);
            setLocations(locations);
            setFilteredLocationsByCity(locations);
            setFilteredLocations(locations);
            setIsLoaded(true);
        }

        let getAllTypes = async (e) => {
            let types = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.type}`,
                getAccessTokenSilently
            );
            setTypes(types);
        }

        let getAllCities = async (e) => {
            let cities = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.city}`,
                getAccessTokenSilently
            );
            setCities(cities);
        }
        getAllCities().catch();
        getAllTypes().catch();
        fetchLocation().catch();
    }, []);

    useEffect(() => {
        console.log('5.la liste filtrée', filteredLocationsByCity);
        filterArray().catch();
    }, [filteredLocationsByCity]);

    useEffect(() => {
        //Filter the list to re-render only the location from one city
        console.log('2.change la ville', cityChoosed);
        if (cityChoosed !== null) {
            setFilteredLocationsByCity(locations.filter(location => location.id_City === cityChoosed.id));
        } else {
            setFilteredLocationsByCity(locations);
        }


    }, [cityChoosed]);

    let handleClose = async () => {
        setShowAddModal(false);
    }

    let handleAddClick = () => {
        setShowAddModal(true);
    }

    const handleMenuClick = async (event) => {
        setAnchorEl(event.currentTarget);
    }
    const handleMenuClose = () => {
        setAnchorEl(null);
    }

    let addFilter = async (value) => {
        if (selectedFilter.length !== 0) {
            let array = selectedFilter;
            let index = array.indexOf(value);
            if (index !== -1) {
                array.splice(index, 1);
                setSelectedFilter(array);
            } else {
                selectedFilter.push(value);
            }
        } else {
            selectedFilter.push(value);
        }

        await filterArray();
    }

    let filterArray = async () => {
        console.log('filtre', filteredLocationsByCity);
        filteredLocations = [];
        selectedFilter.map(filter => {
            let locationBySelectedFilter = filteredLocationsByCity.filter(location => location.id_Type === filter);
            locationBySelectedFilter.forEach(location => {
                filteredLocations.push(location);
            })
        })
        if (selectedFilter.length === 0) {
            filteredLocations = filteredLocationsByCity;

        }
        ;
        setFilteredLocations(filteredLocations);
    }

    return (
        <>
            <div className="map-container">
                <div className="map-left">
                    {locations.length === 0 ? <Skeleton variant="rect" style={{height: "100vh", width: "100%"}}/>
                        : <OpenMap locations={locations}
                                   cities={cities}
                                   positionUser={userContext.userPosition}
                                   setCityChoosed={setCityChoosed}
                        />}
                </div>

                <div className="locations-right">
                    <div style={{marginBottom: "1em"}}>
                        <Button variant="contained" color="primary" aria-controls="simple-menu" aria-haspopup="true"
                                onClick={handleMenuClick}>Filter</Button>
                        <Button variant="contained" color="default" onClick={handleAddClick}>Add a new Location</Button>
                    </div>
                    <Menu
                        id="filters-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        {types.map((type, index) => (
                            <MenuItem key={type.id} value={type.id} selected={false}>
                                <CheckBox value={type.id}
                                    //onClick={(value) => handleMenuItemClick(parseInt(value.target.value))}
                                          onClick={(value) => addFilter(parseInt(value.target.value))}
                                >
                                </CheckBox>
                                {type.description}
                            </MenuItem>
                        ))}
                    </Menu>
                    <SimpleBar style={{maxHeight: "95%", height: "inherit"}}>
                        {isLoaded ? (<LocationsList locations={filteredLocations} style={{marginBottom: "1em"}}/>) :
                            <LinearProgress/>}
                    </SimpleBar>
                </div>
            </div>

            {showAddModal ?
                <AddLocationModal showAddModal={showAddModal} handleClose={handleClose} cities={cities}/> : null}
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
        if (userContext.userAuthenticated === null) {
            return;
        }
        if (userContext.userAuthenticated.isCreator) {
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
                        <Navbar.Brand><NavLink to="/" className="homeLinks">OpenSunday</NavLink></Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="mr-auto">
                                {userContext.userAuthenticated ? null : (
                                    <NavLink to="/UserForm" className="navLinks">Register</NavLink>
                                )}
                                {isCreator ? (
                                    <NavLink to="/ManageLocation" className="navLinks">Manage Locations</NavLink>
                                ) : null}
                                <NavLink to="/Admin" className="navLinks">Administrator</NavLink>
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
                                    <Button variant="contained" color="primary"
                                            onClick={handleLoginClick}>Login</Button>
                                </div>
                            )}
                        </Route>
                        <Route exact path="/location/:locationId">
                            {isAuthenticated ? <OpenSundayMap/> : (
                                <div>
                                    <h1>Welcome to OpenSunday, please log in</h1>
                                    <Button variant="contained" color="primary"
                                            onClick={handleLoginClick}>Login</Button>
                                </div>
                            )}
                        </Route>
                        <ProtectedRoute exact path="/UserForm" component={UserForm}/>
                        <ProtectedRoute exact path="/Admin" component={Administrator}/>
                        <ProtectedRoute exact path="/ManageLocation" >
                            <ManageLocation isAdmin={false}/>
                        </ProtectedRoute>
                    </Switch>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;