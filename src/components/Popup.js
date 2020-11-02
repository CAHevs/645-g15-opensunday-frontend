import React from "react";
import redPin from '../assets/redPin.png';
import Restaurant from '../assets/Restaurant.png';
import Bar from '../assets/Bar.png';
import Museum from '../assets/Museum.jpg';
import L from 'leaflet';

function Popup() {

    //Restaurant's icon
    let Restaurant = L.icon({
        iconUrl: Restaurant,
        iconSize: [38, 95], 
        shadowSize: [50, 64], 
        iconAnchor: [22, 94], 
        shadowAnchor: [4, 62],  
        popupAnchor: [-3, -76]
    });


    //Position's icon
    let redIcon = L.icon({
        iconUrl: redPin,
        iconSize: [38, 95], // size of the icon
        shadowSize: [50, 64], // size of the shadow
        iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor: [-3, -76]
    });



    //Bar's icon
    let Bar = L.icon({
        iconUrl: Bar,
        iconSize: [38, 95], 
        shadowSize: [50, 64], 
        iconAnchor: [22, 94], 
        shadowAnchor: [4, 62],  
        popupAnchor: [-3, -76]
    });

        //Museum's icon
        let Museum = L.icon({
            iconUrl: Museum,
            iconSize: [38, 95], 
            shadowSize: [50, 64], 
            iconAnchor: [22, 94], 
            shadowAnchor: [4, 62],  
            popupAnchor: [-3, -76]
        });







}

export default Popup;
