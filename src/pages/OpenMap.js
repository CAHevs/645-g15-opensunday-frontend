import React, { useContext, useState, useEffect } from 'react';
import request from "../utils/request";
import { useAuth0 } from "@auth0/auth0-react";
import endpoints from "../endpoints";
import { Link } from "react-router-dom";
import logo from '../logo.svg';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import redPin from '../assets/redPin.png';
import RestaurantPin from '../assets/RestaurantPin.png';
import BarPin from '../assets/BarPin.png';
import MuseumPin from '../assets/MuseumPin.png';
import TheaterPin from '../assets/TheaterPin.png';
import CinemaPin from '../assets/CinemaPin.png';
import { UserContext } from "../utils/UserContext"
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from "@material-ui/core/TextField";
import Loading from '../components/Loading';
import { EmailIcon } from "react-share";
import { Button } from '@material-ui/core';
import { useHistory, useParams } from "react-router-dom";
import Control from "react-leaflet-control";
import NavigationTwoToneIcon from '@material-ui/icons/NavigationTwoTone';
import useOnclickOutside from "react-cool-onclickoutside";
import {useSnackbar} from "notistack";

function OpenMap(props) {

    //Position's icon
    let redIcon = L.icon({
        iconUrl: redPin,
        iconSize: [38, 95], // size of the icon
        shadowSize: [50, 64], // size of the shadow
        iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor: [-3, -76]
    });

    //Restaurant's icon
    let Restaurant = L.icon({
        iconUrl: RestaurantPin,
        iconSize: [38, 95],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    });

    //Bar's icon
    let Bar = L.icon({
        iconUrl: BarPin,
        iconSize: [38, 95],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    });

    //Museum's icon
    let Museum = L.icon({
        iconUrl: MuseumPin,
        iconSize: [38, 95],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    });

    //Theater's icon
    let Theater = L.icon({
        iconUrl: TheaterPin,
        iconSize: [38, 95],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    });

    //Cinema's icon
    let Cinema = L.icon({
        iconUrl: CinemaPin,
        iconSize: [38, 95],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    });

    const setCityChoosed = props.setCityChoosed;

    //Auth0
    let {
        loginWithRedirect,
        getAccessTokenSilently,
        user,
    } = useAuth0();


    let [selectedCity, setSelectedCity] = useState(null);

    //By default, the center of the map is at Sion, Valais
    let [mapCenter, setmapCenter] = useState([46.2333, 7.35]);

    const [openMarker, setOpenMarker] = useState(false);
    //Get all the cities from OpenSundayMap()
    let cities = props.cities;

    //Get the locations from the "LocationsList.js" function in OpenSundayMap()
    let locations = props.locations;

    //Get the location id from the URL
    let { locationId } = useParams();
    let location = null;

    const { enqueueSnackbar } = useSnackbar();
    const userContext = useContext(UserContext);
    const history = useHistory();

    const ref = useOnclickOutside(() => {
        setOpenMarker(false);
    });


    //Set the url with location's id
    const handleClick = (event, loc) => {
        history.push("/location/" + loc.id);
        setOpenMarker(!openMarker);
    };

    //If the user doesn't come from an url/id
    if (locationId === undefined) {
        locationId = null;
    } else {
        location = locations.find(loc => loc.id === +locationId);

        //If location not found with the id given
        if (location === undefined) {
            history.push("/");
            locationId = null;
        }
    }

    // Get the position from the props given from Home page
    useEffect(() => {
        if (userContext.userPosition === null) {
            navigator.geolocation.getCurrentPosition(async function (position) {
                //Set the userContext with lat and lng from navigator
                userContext.setUserPosition([position.coords.latitude, position.coords.longitude]);

                //If the user doesn't want to give his location, set it null
            }, () => {
                userContext.setUserPosition("notAllowed");
            });
        }
    }, [userContext.userPosition]);

    //method find me: set the  map's center and clean the url

    //useEffect to set the center of the map linked to the user or the id
    //Button find me
    const handleLocateMe = () => {
        if (userContext.userPosition === null || userContext.userPosition === "notAllowed") {
            enqueueSnackbar("We couldn't locate you :( Can you refresh the page ?", {variant: "warning"})
        } else {
            setmapCenter(userContext.userPosition);
            history.push("/");
        }
    }

    const handleCitySubmit = async (event, value) => {
        if(value === null){
            return setCityChoosed(value);
        }
        //Define search text with city code and the city name
        const searchText = value.code + " " + value.name;

        //Retrieve the lat and lng of the city choosed with an Map Box api
        let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchText}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`;
        let response = await fetch(url, {});
        let data = await response.json();
        if(data.features !== null || data.features[0] !== undefined){
            setmapCenter([data.features[0].center[1],data.features[0].center[0]]);
        }

        //Define the city choosed with the method given in props to filter the list of locations
        setCityChoosed(value);
    }

    //useEffect to set the center of the map
    useEffect(() => {
        locationId === null ? (
            //if the user doesn't give his location, the map's center is by default at Sion, Valais
            userContext.userPosition === null || userContext.userPosition === "notAllowed" ? setmapCenter([46.2333, 7.35]) : setmapCenter(userContext.userPosition)

        ) ://if an id is selected, the map's center is on this locations id
            setmapCenter([location.lat, location.lng])
    }, [locationId]);

    return (
        <>
            <Map
                className="map"
                center={mapCenter}
                zoom={16}
            >
                <Control position="topright">
                    <Autocomplete
                        id="combo-box"
                        options={cities}
                        getOptionLabel={(city) => city.name}
                        style={{width: 300, margin: "1%",}}
                        onChange={(event, value)=>handleCitySubmit(event, value)}
                        renderInput={(params) => <TextField {...params} label="City" variant="outlined" style={{backgroundColor: "white", borderRadius: "6px"}}/>}
                    />
                </Control>
                {/* Display the button FindMe if the user authorizes it*/}
                {userContext.userPosition === null || userContext.userPosition === "notAllowed" ? null : (
                    <Control position="bottomright">
                        <Button ref={ref} size="small" variant="contained" onClick={handleLocateMe}>Find me<NavigationTwoToneIcon /></Button>
                    </Control>
                )}
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                />
                {
                    locations.map((loc) =>
                        //Get latitude and longitude from each location and display it in a Marker on the map
                        <Marker key={`marker-${loc.id}`} position={[loc.lat, loc.lng]}

                            //Define the icon from the type of the loc
                            icon={eval(loc.type.description)}

                            //Change the url with location id by clicking
                            onClick={(event) => handleClick(event, loc)}
                        >
                            <Popup>
                                {openMarker &&
                                    <span>
                                        {loc.name} <br /> {loc.type.description} <br />
                                        <EmailIcon size={25} round={true}> </EmailIcon>
                                        <a className="video-email_button button-hover"
                                            href={"mailto:?subject=I wanted you to see this " + loc.type.description + "&body=Hey, check out the " + loc.type.description + "'s link: https://grp15.p645.hevs.ch/location/" + loc.id + " on OpenSundayMap !"}
                                            title="Share viaEmail">
                                            <span className="video-email_button-text">Share me</span>
                                        </a>
                                    </span>
                                }

                            </Popup>
                        </Marker>
                    )}

                {/* Display the redPin form user's location if it exists */}
                {!(userContext.userPosition === null || userContext.userPosition === "notAllowed") &&
                    <Marker
                        position={userContext.userPosition}
                        icon={redIcon}
                    >
                        <Popup>You are here</Popup>
                    </Marker>
                }
            </Map>
        </>
    );
}
export default OpenMap;