import React, {useEffect, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import request from "../utils/request";
import endpoints from "../endpoints.json";
import Table from "@material-ui/core/Table";

export default function ManageLocations(props){
    //let locations = props.location;
    let [locations, setLocations] = useState([]);
    let [types, setTypes] = useState([]);
    let [cities, setCities] = useState([]);
    let [creators, setCreators] = useState([]);


    useEffect(() => {
        let fetchEverything = async(e) => {
            await fetchLocations();
            await fetchTypes();
            await fetchCities();
            await fetchCreator();
        }

        fetchEverything();

    }, []);

    let {
        getAccessTokenSilently,
        user,
    } = useAuth0();

    let fetchLocations = async(e) => {
        locations = await request(`${process.env.REACT_APP_SERVER_URL}${endpoints.location}`,
            getAccessTokenSilently);
        setLocations(locations);
    }

    let fetchTypes = async(e) => {
        types = await request(`${process.env.REACT_APP_SERVER_URL}${endpoints.type}`, getAccessTokenSilently);
        setTypes(types);
    }

    let fetchCities = async(e) => {
        cities = await request(`${process.env.REACT_APP_SERVER_URL}${endpoints.city}`, getAccessTokenSilently);
        setCities(cities);
    }

    let fetchCreator = async(e) =>  {
        creators = await request(`${process.env.REACT_APP_SERVER_URL}${endpoints.city}`, getAccessTokenSilently)
    }

    let handleAddLocation = async(values) => {

    }

    let addLocation  = async(e) => {

    }

    let handleUpdateLocation = async (values) => {

    }

    let updateLocation = async(path, token, updatedLocation) => {
        let response = fetch(path, {
            method: 'PUT',
            headers:{
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                'Content-Type': "application/json",

            },
            body: updatedLocation,
        });
    };

    let buildTable = async(e) => {
        const listLocations = locations.map(location =>
        <>
            <td>{location.name}</td>
            <td>{location.address}</td>
            <td>{location.lat}</td>
            <td>{location.lng}</td>
            <td>{location.url}</td>
            <td>{location.type.description}</td>
            <td>{location.city.name}</td>
            <td>{location.user.name}</td>
        </>
        )
        return (
          <tr>{listLocations}</tr>
        );
    }

    return (
        <>
            All Locations created by :
            {/* Create a table with all the informations */}
            <Table>
                <tr>
                    <th>Location</th>
                    <th>Adresse</th>
                    <th>Lat</th>
                    <th>Lng</th>
                    <th>Url</th>
                    <th>Type</th>
                    <th>City</th>
                    <th>Creator</th>
                </tr>
                {/* faire une boucle ici pour afficher de manière dynamique */}
                {buildTable}
            </Table>
        </>
    )
}