import React, {useContext, useState, useEffect} from 'react';
import L from 'leaflet';
import {Map, TileLayer, Marker, Popup} from 'react-leaflet';
import redPin from '../assets/redPin.png';
import RestaurantPin from '../assets/RestaurantPin.png';
import BarPin from '../assets/BarPin.png';
import MuseumPin from '../assets/MuseumPin.png';
import TheaterPin from '../assets/TheaterPin.png';
import CinemaPin from '../assets/CinemaPin.png';
import {UserContext} from "../utils/UserContext"
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from "@material-ui/core/TextField";
import {EmailIcon} from "react-share";
import {Button} from '@material-ui/core';
import {useHistory, useParams} from "react-router-dom";
import Control from "react-leaflet-control";
import NavigationTwoToneIcon from '@material-ui/icons/NavigationTwoTone';
import {useSnackbar} from "notistack";

function OpenMap(props) {

    //Default Icon's options
    let LeafIcon = L.Icon.extend({
        options: {
            iconSize: [70, 70],
            iconAnchor: [22, 94],
            popupAnchor: [-3, -76]
        }
    });

    //Define all icon's image
    let redIcon = new LeafIcon({iconUrl: redPin});
    let Cinema = new LeafIcon({iconUrl: CinemaPin});
    let Theater = new LeafIcon({iconUrl: TheaterPin});
    let Restaurant = new LeafIcon({iconUrl: RestaurantPin});
    let Bar = new LeafIcon({iconUrl: BarPin});
    let Museum = new LeafIcon({iconUrl: MuseumPin});

    const setCityChoosed = props.setCityChoosed;

    //By default, the center of the map is at Sion, Valais
    let [mapCenter, setmapCenter] = useState([46.2333, 7.35]);

    //Get all the cities from OpenSundayMap()
    let cities = props.cities;

    //Get the locations from the "LocationsList.js" function in OpenSundayMap()
    let locations = props.locations;

    //Get the location id from the URL
    let {locationId} = useParams();
    let location = null;

    const {enqueueSnackbar} = useSnackbar();
    const userContext = useContext(UserContext);
    const history = useHistory();


    //Set the url with location's id
    const handleClick = (event, loc) => {
        history.push("/location/" + loc.id);
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
        if (value === null) {
            return setCityChoosed(value);
        }
        //Define search text with city code and the city name
        const searchText = value.code + " " + value.name;

        //Retrieve the lat and lng of the city choosed with an Map Box api
        let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchText}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`;
        let response = await fetch(url, {});
        let data = await response.json();
        if (data.features !== null || data.features[0] !== undefined) {
            setmapCenter([data.features[0].center[1], data.features[0].center[0]]);
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
                        onChange={(event, value) => handleCitySubmit(event, value)}
                        renderInput={(params) => <TextField {...params} label="City" variant="outlined"
                                                            style={{backgroundColor: "white", borderRadius: "6px"}}/>}
                    />
                </Control>
                {userContext.userPosition === null || userContext.userPosition === "notAllowed" ? null : (
                    <Control position="bottomright">
                        <Button size="small" variant="contained" onClick={handleLocateMe}>Find
                            me<NavigationTwoToneIcon/></Button>
                    </Control>
                )}
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                />
                {
                    locations.map((loc) =>

                        <Marker key={`marker-${loc.id}`} position={[loc.lat, loc.lng]}
                                icon={eval(loc.type.description)}
                                onClick={(event) => handleClick(event, loc)}
                        >
                            <Popup>
                                    <span>
                                        {loc.name} <br/> {loc.type.description} <br/>
                                        <EmailIcon size={25} round={true}> </EmailIcon>
                                        <a className="video-email_button button-hover"
                                           href={"mailto:?subject=I wanted you to see this " + loc.type.description + "&body=Hey, check out the " + loc.type.description + "'s link: https://grp15.p645.hevs.ch/location/" + loc.id + " on OpenSundayMap !"}
                                           title="Share viaEmail">
                                            <span className="video-email_button-text">Share me</span>
                                        </a>
                                    </span>
                            </Popup>
                        </Marker>
                    )}
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