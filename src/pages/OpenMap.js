import React, { useContext, useState } from 'react';
import request from "../utils/request";
import { useAuth0 } from "@auth0/auth0-react";
import endpoints from "../endpoints";
import { Link } from "react-router-dom";
import logo from '../logo.svg';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import redPin from '../assets/redPin.png';
import leafShadow from '../assets/leaf-shadow.png';
import { UserContext } from "../utils/UserContext"
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from "@material-ui/core/TextField";
import Loading from '../components/Loading';
import { EmailIcon } from "react-share";
import { Button } from '@material-ui/core';

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

  const userContext = useContext(UserContext);

  // Get the position from the props given from Home page
  navigator.geolocation.getCurrentPosition(async function (position) {

    //Set the userContext with lat and lgn from navigator
    userContext.setUserPosition([position.coords.latitude, position.coords.longitude]);

    //If the user doesn't want to give his loocation, set it null
  }, () => { userContext.setUserPosition(null); });

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

      <Map
        className="map"

        //if the user doesn't give his location, the map's center is by default at Sion, Valais
        center={userContext.userPosition === null ? [46.2333, 7.35] : userContext.userPosition}
        zoom={15}
      >
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

                  {loc.name} <br /> {loc.type.description} <br />
                  <EmailIcon size={25} round={true}> </EmailIcon>
                  <a className="video-email_button button-hover" href={"mailto:?subject=I wanted you to see this site&body=Check out this link " + loc.url} title="Share viaEmail">
                    <span className="video-email_button-text">Share me</span>
                  </a>
                </span>
              </Popup>
            </Marker>
          )}

        {/* Display the redPin form user's location if it exists */}
        {!(userContext.userPosition === null) &&
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
