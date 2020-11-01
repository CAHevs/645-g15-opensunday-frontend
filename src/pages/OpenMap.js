import React, {useContext, useState, useEffect} from 'react';
import request from "../utils/request";
import {useAuth0} from "@auth0/auth0-react";
import endpoints from "../endpoints";
import {Link} from "react-router-dom";
import logo from '../logo.svg';
import L from 'leaflet';
import {Map, TileLayer, Marker, Popup} from 'react-leaflet';
import redPin from '../assets/redPin.png';
import leafShadow from '../assets/leaf-shadow.png';
import {UserContext} from "../utils/UserContext"
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from "@material-ui/core/TextField";
import Loading from '../components/Loading';
import {EmailIcon} from "react-share";
import {Button} from '@material-ui/core';
import {useHistory, useParams} from "react-router-dom";
import Control from "react-leaflet-control";
import NavigationTwoToneIcon from '@material-ui/icons/NavigationTwoTone';


function OpenMap(props) {

    let {
        loginWithRedirect,
        getAccessTokenSilently,
        user,
    } = useAuth0();

    let [selectedCity, setselectedCity] = useState(null);

    //Get all the cities from OpenSundayMap()
    let cities = props.cities;


    //Get the locations from the "LocationsList.js" function in OpenSundayMap()
    let locations = props.locations;


    let {locationId} = useParams();
    let location = null;

    const userContext = useContext(UserContext);
    const history = useHistory();

    //If the user doesnt come from an url/id

    if (locationId === undefined) {
        locationId = null;
    } else {
        location = locations.find(loc => loc.id === +locationId);

        //If location not found with the id given
        if(location === undefined){
            history.push("/");
            locationId=null;
        }
        //console.log('location', location);
        //console.log('locations', locations);
        //console.log('locationId', locationId);
    }

    //let location = props.location;


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

    const handleLocateMe = () => {
        console.log('locate me');
    }


    let redIcon = L.icon({
        iconUrl: redPin,
        shadowUrl: leafShadow,
        iconSize: [38, 95], // size of the icon
        shadowSize: [50, 64], // size of the shadow
        iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor: [-3, -76]
    });

    return (
        <>


            <Map
                className="map"


                center={
                    locationId === null ? (
                            //if the user doesn't give his location, the map's center is by default at Sion, Valais
                            userContext.userPosition === null || userContext.userPosition === "notAllowed" ? [46.2333, 7.35] : userContext.userPosition
                        ) ://if an id is selected, the map's center is on this locations id
                        [location.lat, location.lng]
                }
                zoom={15}
            >
                <Control position="topright">
                    <Autocomplete
                        id="combo-box"
                        options={cities}
                        getOptionLabel={(city) => city.name}
                        style={{width: 300, margin: "1%",}}
                        onChange={(value)=>setselectedCity(value)}
                        renderInput={(params) => <TextField {...params} label="City" variant="outlined" style={{backgroundColor: "white", borderRadius: "6px"}}/>}
                    />
                </Control>
                <Control position="bottomright">
                    <Button size="small" variant="contained" onClick={handleLocateMe}><NavigationTwoToneIcon/></Button>
                </Control>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                />

                {

                    locations.map((loc, index) =>
                        //Get latitude and longitude from each location and display it in a Marker on the map
                        <Marker key={`marker-${index}`} position={[loc.lat, loc.lng]}>
                            <Popup>
                                <span>

                                  {loc.name} <br/> {loc.type.description} <br/>
                                  <EmailIcon size={25} round={true}> </EmailIcon>
                                  <a className="video-email_button button-hover"
                                     href={"mailto:?subject=I wanted you to see this site&body=Check out this link " + loc.url}
                                     title="Share viaEmail">
                                    <span className="video-email_button-text">Share me</span>
                                  </a>
                                </span>
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
