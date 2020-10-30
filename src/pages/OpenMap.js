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
import {
  EmailShareButton,
  FacebookShareButton,
  OKShareButton,
  FacebookIcon,
  EmailIcon,
} from "react-share";
import { ShareButton } from "react-custom-share";
import FaFacebook from "react-icons/lib/fa/facebook";
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

    //If the user doesn't want to give his loocation, set it at Sion, Valais
  }, () => { userContext.setUserPosition([46.2333, 7.35]); });

  // userContext.setUserPosition([46.25, 7.15]);

  let grenIcon = L.icon({
    iconUrl: redPin,
    shadowUrl: leafShadow,
    iconSize: [38, 95], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor: [-3, -76]
  });


  const shareButtonProps = {
    url: "https://github.com/greglobinski/react-custom-share",
    network: "Facebook",
    text: "Give it a try - react-custom-share component",
    longtext:
      "Social sharing buttons for React. Use one of the build-in themes or create a custom one from the scratch."
  };



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

      {userContext.userPosition === null ? <Loading></Loading>
        :
        <Map
          className="map"

          //if the user doesn't give his location, the map's center is by default at Sion, Valais
          // center={userContext.userPosition === null ? [46.2333, 7.35] : userContext.userPosition}
          center={userContext.userPosition}
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

                    {loc.name} <br /> {loc.type.description} <br /> <EmailIcon size={32} round={true} /> <br />
                    {/* {console.log("URL from locations: "+loc.Url.url)} */}
                  </span>
                </Popup>
              </Marker>



            )}

          <Marker
            position={userContext.userPosition}
            icon={grenIcon}
          >
            <Popup>You are here</Popup>
          </Marker>

          <button>FIND ME</button>
        </Map>
      }
    </>
  );
}
export default OpenMap;
