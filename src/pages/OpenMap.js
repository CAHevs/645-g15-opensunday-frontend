import React, {useContext} from 'react';
import request from "../utils/request";
import { useAuth0 } from "@auth0/auth0-react";
import endpoints from "../endpoints";
import { Link } from "react-router-dom";
import logo from '../logo.svg';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import leafGreen from '../assets/leaf-green.png';
import leafRed from '../assets/leaf-red.png';
import leafOrange from '../assets/leaf-orange.png';
import leafShadow from '../assets/leaf-shadow.png';
import { UserContext } from "../utils/UserContext"

let grenIcon = L.icon({
  iconUrl: leafGreen,
  shadowUrl: leafShadow,
  iconSize: [38, 95], // size of the icon
  shadowSize: [50, 64], // size of the shadow
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor: [-3, -76]
});


function OpenMap(props) {

  //Get the locations from the "LocationsList.js" function in OpenSundayMap()
  let locations = props.locations;
  const userContext = useContext(UserContext);


  //Get the position from the props given from Home page
  let positionUser = props.positionUser;
  navigator.geolocation.getCurrentPosition(async function (position) {

    //Set the userContext with lat and lgn from navigator
    userContext.userPosition = [position.coords.latitude, position.coords.longitude];
  });


  return (

    <Map
      className="map"
      center={userContext.userPosition === null ? [46.2333,7.35]: userContext.userPosition}
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
    </Map>
  );
}
export default OpenMap;
