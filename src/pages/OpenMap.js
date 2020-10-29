import React, { useContext, useState } from 'react';
import request from "../utils/request";
import { useAuth0 } from "@auth0/auth0-react";
import endpoints from "../endpoints";
import { Link } from "react-router-dom";
import logo from '../logo.svg';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import leafGreen from '../assets/leaf-green.png';
import leafShadow from '../assets/leaf-shadow.png';
import { UserContext } from "../utils/UserContext"
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from "@material-ui/core/TextField";

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
    let positionUser = props.positionUser;
    navigator.geolocation.getCurrentPosition(async function (position) {

      //Set the userContext with lat and lgn from navigator
      userContext.setUserPosition = [position.coords.latitude, position.coords.longitude];
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
        center={userContext.userPosition === null ? [46.2333, 7.35] : userContext.userPosition}
        zoom={15}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        {locations.map((loc, index) =>

          //Get latitude and longitude from each location and display it in a Marker on the map
          <Marker key={`marker-${index}`} position={[loc.lat, loc.lng]}>
            <Popup>
              <span>{loc.name} <br /> {loc.type.description}</span>
            </Popup>
          </Marker>
        )}
        <button>FIND ME</button>
      </Map>

    </>
  );
}
export default OpenMap;
