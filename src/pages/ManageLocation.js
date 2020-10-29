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
import {Redirect} from "react-router-dom";
import * as Yup from "yup";

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
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDelModal, setShowDelModal] = useState(false);
    let delMod = false;
    let addMod = false;

    const userContext = useContext(UserContext);

    useEffect(() => {
        let fetchEverything = async(e) => {
            await fetchLocations();
            await fetchTypes();
            await fetchCities();
            await fetchCreator();
        }

        fetchEverything();
    }, []);

    const initialValues = {
        name: "",
        address: "",
        id_Type: "",
        url: "",
        id_City: "",
        lat: "",
        lng: ""
    };

    const addLocationSchema = Yup.object().shape({
        name: Yup.string()
            .min(2, 'Too Short')
            .max(50, 'Too Long')
            .required('Required'),
        address: Yup.string()
            .min(2, 'Too Short')
            .max(50, 'Too Long')
            .required('Required'),
        url: Yup.string()
            .min(5, 'Too Short')
            .max(250, 'Too Long')
            .required('Required'),
        lat: Yup.number()
            .required('Required'),
        lng: Yup.number()
            .required('Required')
    })

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
        setShowAddModal(false);
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

    let handleAddClick = () => {
        addMod = true;
        setShowAddModal(true);
    }

    let handleAddSubmit = async(values) => {

        let newLocation = values;

        if(values.id_Type == ""){
            newLocation["id_Type"] = 1;
        }
        if(values.id_City == ""){
            newLocation["id_City"] = 1;
        }

        newLocation["id_User"] = userContext.userAuthenticated.id;

        newLocation = JSON.stringify(newLocation);
        console.log(newLocation);

        let path = process.env.REACT_APP_SERVER_URL + endpoints.location;

        let token = await getAccessTokenSilently();

        let response = await fetch(path, {
            method: 'POST',
            headers:{
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                'Content-Type': "application/json",

            },
            body: newLocation,
        });

        addMod = false;
        handleClose();
    }

    return (
        <>
            <h3>All Locations created by :</h3>
            <p>
                <Button onClick={handleAddClick}>Add a new Location</Button>
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
                                <Field as="select" name="id_Type">
                                    {types.map(type =>
                                    <option value={type.id}>{type.description}</option>
                                    )}
                                </Field><br/>
                                <Field
                                    type="text"
                                    name="url"
                                    defaultValue={selection.map(part => part.url)}
                                /><br/>
                                <Field as="select" name="id_City">
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
            {addMod == true ? false: (
                <Modal show={showAddModal} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add new location</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Formik initialValues={initialValues}
                                validationSchema={addLocationSchema}
                                onSubmit={values => (handleAddSubmit(values))}
                        >
                            {({errors, touched}) => (
                                <Form>
                                    <Field
                                        type="text"
                                        name="name"
                                        placeholder="Location name"
                                    />
                                    {errors.name && touched.name ? (
                                        <div>{errors.name}</div>
                                    ): null}
                                    <br/>
                                    <Field
                                        type="text"
                                        name="address"
                                        placeholder="Address"
                                    />
                                    {errors.address && touched.address ? (
                                        <div>{errors.address}</div>
                                    ): null}
                                    <br/>
                                    <Field as="select" name="id_Type">
                                        {types.map(type =>
                                            <option value={type.id}>{type.description}</option>
                                        )}
                                    </Field>
                                    <br/>
                                    <Field
                                        type="text"
                                        name="url"
                                        placeholder="Url"
                                    />
                                    {errors.url && touched.url ? (
                                        <div>{errors.url}</div>
                                    ): null}
                                    <br/>
                                    <Field
                                        type="number"
                                        name="lat"
                                        placeholder="Lat"
                                    />
                                    {errors.lat && touched.lat ? (
                                        <div>{errors.lat}</div>
                                    ): null}
                                    <br/>
                                    <Field
                                        type="number"
                                        name="lng"
                                        placeholder="Lng"
                                    />
                                    {errors.lng && touched.lng ? (
                                        <div>{errors.lng}</div>
                                    ): null}
                                    <br/>
                                    <Field as="select" name="id_City">
                                        {cities.map(city =>
                                            <option value={city.id}>{city.name}</option>
                                        )}
                                    </Field><br/>
                                    <button type="submit" >Create</button>
                                </Form>
                            )}

                        </Formik>
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