import React from 'react';
import Location from "../components/Location";
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



let grenIcon = L.icon({
  iconUrl: leafGreen,
  shadowUrl: leafShadow,
  iconSize: [38, 95], // size of the icon
  shadowSize: [50, 64], // size of the shadow
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor: [-3, -76]
});

let redIcon = L.icon({
  iconUrl: leafRed,
  shadowUrl: leafShadow,
  iconSize: [38, 95], // size of the icon
  shadowSize: [50, 64], // size of the shadow
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor: [-3, -86]
});

let orangeIcon = L.icon({
  iconUrl: leafOrange,
  shadowUrl: leafShadow,
  iconSize: [38, 95], // size of the icon
  shadowSize: [50, 64], // size of the shadow
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor: [-3, -86]
});


function OpenMap(props) {

  //Get the locations from the "getlocation" method in OpenSundayMap()
  let locations = props.locations;

  let center = [46.36, 7.15];

  //let positionUser 
  //let positionUser = props.positionUser;

  return (
    <Map
      center={46.36, 7.15}
      //onClick={this.addMarker}
      zoom={13}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
      />
      {locations.map((loc, idx) =>              //loc.lat , loc. lgt
        <Marker key={`marker-${idx}`} position={[46.36, 7.15]}>
          <Popup>
            <span>loc.name <br /> loc.type ?. <br>Much more info below !</br></span>
          </Popup>
        </Marker>
      )}
    </Map>);


}
export default OpenMap;
