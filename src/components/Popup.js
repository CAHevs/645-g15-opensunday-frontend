import React from "react";
import redPin from '../assets/redPin.png';
import RestaurantPin from '../assets/RestaurantPin.png';
import BarPin from '../assets/BarPin.png';
import MuseumPin from '../assets/MuseumPin.png';
import TheaterPin from '../assets/TheaterPin.png';
import CinemaPin from '../assets/CinemaPin.png';
import L from 'leaflet';

//Position's icon
export let redIcon = L.icon({
    iconUrl: redPin,
    iconSize: [38, 95], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor: [-3, -76]
});

//Restaurant's icon
export let Restaurant = L.icon({
    iconUrl: RestaurantPin,
    iconSize: [38, 95],
    shadowSize: [50, 64],
    iconAnchor: [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -76]
});



//Bar's icon
export let Bar = L.icon({
    iconUrl: BarPin,
    iconSize: [38, 95],
    shadowSize: [50, 64],
    iconAnchor: [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -76]
});

//Museum's icon
export let Museum = L.icon({
    iconUrl: MuseumPin,
    iconSize: [38, 95],
    shadowSize: [50, 64],
    iconAnchor: [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -76]
});


//Museum's icon
export let Theater = L.icon({
    iconUrl: TheaterPin,
    iconSize: [38, 95],
    shadowSize: [50, 64],
    iconAnchor: [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -76]
});

//Museum's icon
export let Cinema = L.icon({
    iconUrl: CinemaPin,
    iconSize: [38, 95],
    shadowSize: [50, 64],
    iconAnchor: [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -76]
});

// export default Popup;
