import React, {useContext, useEffect, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import request from "../utils/request";
import endpoints from "../endpoints.json";
import {DataGrid} from '@material-ui/data-grid';
import Button from "@material-ui/core/Button";
import Modal from "react-bootstrap/Modal";
import {Field, Form, Formik} from "formik";
import {UserContext} from "../utils/UserContext";
import TextField from '@material-ui/core/TextField';
import AddLocationModal from "../components/AddLocationModal";
import DefineDatesModal from "../components/DefineDatesModal";
import {useSnackbar} from "notistack";


// Columns for the DataGrid
const columns = [
    {field: 'id', headerName: 'ID'},
    {field: 'name', headerName: 'Location', width: 250},
    {field: 'address', headerName: 'Address', width: 300},
    {
        field: 'type', headerName: 'Type', width: 150, valueGetter: (params) =>
            `${params.getValue('type').description}`
    },
    {field: 'url', headerName: 'Url', width: 300},
    {
        field: 'city', headerName: 'City', valueGetter: (params) =>
            `${params.getValue('city').name}`
    },
];

// Model to sort the DataGrid
const sortModel = [
    {
        field: 'id',
        sort: 'asc',
    },
];

export default function ManageLocations(props) {
    let isAdmin = props.isAdmin;
    let [locations, setLocations] = useState([]);
    let [types, setTypes] = useState([]);
    let [cities, setCities] = useState([]);
    let [selection, setSelection] = useState([]);
    let [locationToDefineDates, setLocationToDefineDates] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDelModal, setShowDelModal] = useState(false);
    const [showDefineDatesModal, setShowDefineDatesModal] = useState(false);
    const {enqueueSnackbar} = useSnackbar();
    let delMod = false;
    let addMod = false;

    let userContext = useContext(UserContext);

    //This useEffect check if the user is Authenticated and if
    //yes, it will fetch all the locations
    useEffect(() => {
        if (userContext.userAuthenticated === null) {
            return;
        }
        fetchLocations().catch();
    }, [userContext]);

    //This useEffect fetch everything except the locations
    useEffect(() => {
        let fetchEverything = async () => {
            //await fetchLocations();
            await fetchTypes();
            await fetchCities();
        }

        fetchEverything().catch();
    }, []);

    // The editedValues will be use in the edit modal
    let editedValues = {
        name: "",
        address: "",
        id_Type: "",
        url: "",
        id_City: "",
        lat: "",
        lng: "",
    }


    let {
        getAccessTokenSilently
    } = useAuth0();

    //The method to fetch all locations and if the user is not admin, it will
    //filter the locations to get only the one created by the user
    let fetchLocations = async () => {
        locations = await request(`${process.env.REACT_APP_SERVER_URL}${endpoints.location}`,
            getAccessTokenSilently);
        if (!isAdmin) {
            locations = locations.filter(location => location.id_User === userContext.userAuthenticated.id);
        }
        setLocations(locations);
    }

    //The method to fetch all the types
    let fetchTypes = async () => {
        types = await request(`${process.env.REACT_APP_SERVER_URL}${endpoints.type}`, getAccessTokenSilently);
        setTypes(types);
    }

    //The method to fetch all the cities
    let fetchCities = async () => {
        cities = await request(`${process.env.REACT_APP_SERVER_URL}${endpoints.city}`, getAccessTokenSilently);
        setCities(cities);
    }

    //The method that will update a location when we make an edit
    let updateLocation = async (path, token, updatedLocation) => {
        await fetch(path, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                'Content-Type': "application/json",

            },
            body: updatedLocation,
        }).then(() => {
            enqueueSnackbar("Location successfully updated", {variant: 'success'})
        });
    };

    //Method to close all modales and fetchLocations right after since
    //we have added/updated/deleted a location in order to rerender the list
    let handleClose = async () => {
        setShowEditModal(false);
        setShowDelModal(false);
        setShowAddModal(false);
        setShowDefineDatesModal(false);
        await fetchLocations();
    }

    //Method to show the Edit Modal
    let handleEditClick = () => {
        if (selection.length === 1) {
            setShowEditModal(true);
        } else {
            enqueueSnackbar("Please select one location !", {variant: 'warning'})
        }

    }

    //Method to show the DefineDates Modal
    let handleDefineDates = () => {
        if (selection.length === 1) {
            setLocationToDefineDates(selection[0]);
            setShowDefineDatesModal(true);
        } else {
            enqueueSnackbar("Please select one location !", {variant: 'warning'})
        }

    }

    //Method called when the Formik Form is submited for an edit.
    //We manage the Int by parsing them since we receive them as string
    //We manage the default value too
    let handleEditSubmit = async (values) => {

        let id = selection.map(part => part.id);

        //let editedLocation = values[0];
        let editedLocation = editedValues;
        editedLocation["id"] = parseInt(id);
        if (editedLocation["id_Type"] === "") {
            editedLocation["id_Type"] = parseInt(values[0].id_Type);
        }
        if (editedLocation["id_City"] === "") {
            editedLocation["id_City"] = parseInt(values[0].id_City);
        }
        editedLocation["id_User"] = userContext.userAuthenticated.id;
        if (editedLocation["name"] === "") {
            editedLocation["name"] = values[0].name;
        }
        if (editedLocation["address"] === "") {
            editedLocation["address"] = values[0].address;
        }
        if (editedLocation["url"] === "") {
            editedLocation["url"] = values[0].url;
        }
        if (editedLocation["lat"] === "") {
            editedLocation["lat"] = parseFloat(selection[0].lat);
        }
        if (editedLocation["lng"] === "") {
            editedLocation["lng"] = parseFloat(selection[0].lng);
        }

        editedLocation = JSON.stringify(editedLocation);

        let path = process.env.REACT_APP_SERVER_URL + endpoints.location + "/" + id;
        let token = await getAccessTokenSilently();
        await updateLocation(path, token, editedLocation);
        await handleClose();
    }

    //Method that show the DelModal and set a boolean to true
    //in order to render the right modal
    let handleDeleteClick = () => {
        if (selection.length == 1) {
            delMod = true;
            setShowDelModal(true);
        } else {
            enqueueSnackbar("Please select one location !", {variant: 'warning'})
        }

    }

    //Method that will delete a location depending on the
    //id of the selected row in the datagrid
    let deleteLocation = async () => {

        const idToDelete = selection[0].id;

        let path = process.env.REACT_APP_SERVER_URL + endpoints.location + "/" + idToDelete;

        let token = await getAccessTokenSilently();

        let response = fetch(path, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            }
        });
        delMod = false;
        enqueueSnackbar("Location successfully deleted", {variant: 'success'})
        await handleClose();
    }

    //Method that will show the Add Modal and set a boolean to true to render the right modal
    let handleAddClick = () => {
        addMod = true;
        setShowAddModal(true);
    }

    //Method used in the editModal to set all the modification
    //in a object name editedValues
    let setFieldValue = (field, newValue) => {
        if (field === 'id_Type' || field === 'id_City') {
            editedValues[field] = parseInt(newValue);
        } else {
            editedValues[field] = newValue;
        }
    }

    //Const used for the Field as select
    const fieldSelectStyle = {
        border: 'none',
        width: '24.5ch',
        paddingTop: '20px',
        paddingBottom: '20px'
    }

    return (
        <>
            <h3 style={{color: "black"}}>{isAdmin ? "All Locations" : "My locations"}</h3>
            <p>
                <Button variant="contained" color="primary" style={{margin: "1em"}} onClick={handleAddClick}>Add a new
                    Location</Button>
                <Button variant="contained" color="primary" style={{margin: "1em"}} onClick={handleEditClick}>Edit
                    Selected Row</Button>
                <Button variant="contained" color="primary" style={{margin: "1em"}} onClick={handleDefineDates}>Define
                    Opened Dates</Button>
                <Button variant="contained" color="secondary" style={{margin: "1em"}} onClick={handleDeleteClick}>Delete
                    Selected Row</Button>
            </p>
            <div className="datagrid-container">
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
                              <TextField
                                   type="text"
                                    name="name"
                                    variant="outlined"
                                    onChange={value => setFieldValue('name', value.target.value)}
                                    defaultValue={selection.map(part => part.name)}
                                />
                                <br/>
                                <TextField
                                    type="text"
                                    name="address"
                                    variant="outlined"
                                    onChange={value => setFieldValue('address', value.target.value)}
                                    defaultValue={selection.map(part => part.address)}
                                /><br/>
                                <Field as="select" name="id_Type" style={fieldSelectStyle}
                                       defaultValue={selection.map(part => part.id_Type)}
                                       onChange={value => setFieldValue('id_Type', value.target.value)}
                                >
                                    {types.map(type =>
                                        <option key={type.id} value={type.id}>{type.description}</option>
                                    )}

                                </Field><br/>
                                <TextField
                                    type="text"
                                    name="url"
                                    variant="outlined"
                                    onChange={value => setFieldValue('url', value.target.value)}
                                    defaultValue={selection.map(part => part.url)}
                                /><br/>
                                <Field as="select" name="id_City" style={fieldSelectStyle}
                                       defaultValue={selection.map(part => part.id_City)}
                                       onChange={value => setFieldValue('id_City', value.target.value)}>
                                    {cities.map(city =>
                                        <option key={city.id} value={city.id}>{city.name}</option>
                                    )}

                                </Field><br/><br/>
                                <Button variant="contained" color="primary" type="submit">Edit</Button>
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
            {delMod === true ? false : (
                <Modal show={showDelModal} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete location : {selection.map(part => part.name)}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete this location ? </p>
                        <Button onClick={deleteLocation} color="primary">Yes</Button>
                        <Button onClick={handleClose} color="secondary">No</Button>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="contained" color="secondary" onClick={handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
            {addMod === true ? false : (
                <AddLocationModal showAddModal={showAddModal} handleClose={handleClose} cities={cities}/>)}
            {showDefineDatesModal ?
                <DefineDatesModal showDefineDatesModal={showDefineDatesModal} handleClose={handleClose}
                                  location={locationToDefineDates}/> : null}
        </>
    )
}