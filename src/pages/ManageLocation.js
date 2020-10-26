import React, {useContext, useEffect, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import request from "../utils/request";
import endpoints from "../endpoints.json";
import Table from "@material-ui/core/Table";
import ReactDataGrid from 'react-data-grid';
import {DataGrid, RowsProp, ColDef, SortDirection, ValueGetterParams, CellValue} from '@material-ui/data-grid';
import Button from "@material-ui/core/Button";
import Modal from "react-bootstrap/Modal";
import {Field, Form, Formik} from "formik";
import {UserContext} from "../utils/UserContext";

const columns = [
    {field: 'id', headerName: 'ID'},
    {field: 'name', headerName: 'Location', width:250},
    {field: 'address', headerName: 'Address', width:300},
    {field: 'type',  headerName: 'Type', width: 150, valueGetter: (params) =>
        `${params.getValue('type').description}`
        },
    {field: 'url', headerName: 'Url', width: 300},
    {field: 'city', headerName: 'City', valueGetter: (params) =>
        `${params.getValue('city').name}`
    },
];

const sortModel = [
    {
        field: 'id',
        sort: 'asc',
    },
];

export default function ManageLocations(props){
    //let locations = props.location;
    let [locations, setLocations] = useState([]);
    let [types, setTypes] = useState([]);
    let [cities, setCities] = useState([]);
    let [creators, setCreators] = useState([]);
    let [selection, setSelection] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDelModal, setShowDelModal] = useState(false);
    let delMod = false;

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

    let handleClose = () => {
        setShowEditModal(false);
        setShowDelModal(false);
        //window.location.reload(false);
    }

    let handleEditClick = () => {
        if(selection.length == 1){
            setShowEditModal(true);
        }else{
            console.log("Please select only one location !")
        }

    }

    let handleEditSubmit = async (values) => {

        let id = selection.map(part => part.id);

        console.log(values);

        let editedLocation = values[0];
        if(values.name != null){
            editedLocation["name"] = values.name;
        }
        if(values.address != null){
            editedLocation["address"] = values.address;
        }
        if(values.id_Type != null){
            editedLocation["id_Type"] = values.id_Type.toString();
        }
        if(values.url != null){
            editedLocation["url"] = values.url;
        }
        if(values.id_City != null){
            editedLocation["id_City"] = values.id_City.toString();
        }

        editedLocation = JSON.stringify(editedLocation);
        console.log(editedLocation);

        let path = process.env.REACT_APP_SERVER_URL + endpoints.location +"/"+id;

        let token = await getAccessTokenSilently();
        await updateLocation(path, token, editedLocation);
        handleClose();
    }

    let handleDeleteClick = () =>{
        if(selection.length == 1){
            delMod = true;
            setShowDelModal(true);
        }else{
            console.log("Please select only 1 row !");
        }

    }

    let deleteLocation = async() =>{

        const idToDelete = selection[0].id;

        let path = process.env.REACT_APP_SERVER_URL + endpoints.location +"/"+idToDelete;

        let token = await getAccessTokenSilently();

        let response = fetch(path, {
            method: 'DELETE',
            headers:{
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            }
        });
        delMod = false;
        handleClose();
    }

    return (
        <>
            <h3>All Locations created by :</h3>
            <p>
                <Button>Add a new Location</Button>
                <Button onClick={handleEditClick}>Edit Selected Row</Button>
                <Button onClick={handleDeleteClick}>Delete Selected Row</Button>
            </p>
            <div  style={{ height: 500, width: '90%' }}>
                <DataGrid
                    rows={locations}
                    columns={columns}
                    checkboxSelection={true}
                    onSelectionChange={(newSelection) => {
                        setSelection(newSelection.rows);
                    }}
                    disableSelectionOnClick={true}
                    columnBuffer={2}
                    sortModel={sortModel}
                    getRowMetaData={true}
                />
            </div>
            {selection == null ? null : (
                <Modal show={showEditModal} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit location : {selection.map(part => part.name)}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Formik initialValues={selection}
                            onSubmit={values => (handleEditSubmit(values))}
                        >
                            <Form>
                                <Field
                                    type="text"
                                    name="name"
                                    defaultValue={selection.map(part => part.name)}
                                /><br/>
                                <Field
                                    type="text"
                                    name="address"
                                    defaultValue={selection.map(part => part.address)}
                                /><br/>
                                <Field as="select" name="type">
                                    {types.map(type =>
                                    <option value={type.id}>{type.description}</option>
                                    )}
                                </Field><br/>
                                <Field
                                    type="text"
                                    name="url"
                                    defaultValue={selection.map(part => part.url)}
                                /><br/>
                                <Field as="select" name="city">
                                    {cities.map(city =>
                                    <option value={city.id}>{city.name}</option>
                                    )}
                                </Field><br/><br/>
                                <Button variant="contained" color="primary" type="submit">
                                    Edit
                                </Button>
                            </Form>
                        </Formik>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="contained" color="secondary" onClick={handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
            {delMod == true ? false : (
                <Modal show={showDelModal} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete location : {selection.map(part => part.name)}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete this location ? </p>
                        <Button onClick={deleteLocation}>Yes</Button>
                        <Button onClick={handleClose}>No</Button>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="contained" color="secondary" onClick={handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    )
}