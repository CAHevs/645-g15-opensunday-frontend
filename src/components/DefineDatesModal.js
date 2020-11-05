import {useAuth0} from "@auth0/auth0-react";
import React, {useContext, useEffect, useState} from "react";
import {UserContext} from "../utils/UserContext";
import * as Yup from "yup";
import postRequest from "../utils/postRequest";
import endpoints from "../endpoints.json";
import {Formik} from "formik";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import {makeStyles} from '@material-ui/core/styles';
import Button from "@material-ui/core/Button";
import request from "../utils/request";
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import {useSnackbar} from "notistack";

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 'auto',
    },
    paper: {
        width: 300,
        height: 230,
        overflow: 'auto',
    },
    button: {
        margin: theme.spacing(0.5, 0),
    },
}));

function not(a, b) {
    return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
    return a.filter((value) => b.indexOf(value) !== -1);
}

export default function DefineDatesModal(props) {
    let showDefineDatesModal = props.showDefineDatesModal;
    let handleClose = props.handleClose;
    let location = props.location;

    const { enqueueSnackbar } = useSnackbar();

    const [checked, setChecked] = useState([]);
    const [left, setLeft] = useState([]);
    const [right, setRight] = useState([]);
    let [locationsPerDate, setLocationsPerDate] = useState(null);
    let [dates, setDates] = useState(null);

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const classes = useStyles();
    const {getAccessTokenSilently} = useAuth0();

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const handleAllRight = () => {
        setRight(right.concat(left).sort((a, b) => {
            return a + b;
        }));
        setLeft([]);
    };

    const handleCheckedRight = () => {
        const sorted = right.concat(leftChecked).sort((a, b) => {
            return new Date(a.selected_Date) - new Date(b.selected_Date);
        });
        console.log('sorted right', sorted);
        setRight(sorted);
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        const sorted = left.concat(rightChecked).sort((a, b) => {
            return new Date(a.selected_Date) - new Date(b.selected_Date);
        });
        console.log('sorted left', sorted);
        setLeft(sorted);
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const handleAllLeft = () => {
        setLeft(left.concat(right).sort((a, b) => {
            return a + b;
        }));
        setRight([]);
    };

    let formatDate = (selected_Date) => {
        const date = Date.parse(selected_Date);
        return new Intl.DateTimeFormat('en-gb', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
    };


    useEffect(() => {
        let getAll = async (locationId) => {
            let l = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.location_per_date}/${locationId}/byLocation`,
                getAccessTokenSilently);
            if (l !== 404) {
                setLocationsPerDate(l);
            }

            let response = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.date}`,
                getAccessTokenSilently);
            if (response !== 404) {
                setDates(response);
            }

        };
        if (location !== null) {
            getAll(location.id).catch();
        }


    }, [location]);

    useEffect(() => {
        if (dates !== null) {
            //Get only the future dates
            let futureDates = dates.filter(date => new Date(date.selected_Date) >= new Date().setHours(0, 0, 0, 0));

            //Get the dates that have already been defined as opened and put them in the right list
            //For that, check with the location_per_date
            let closedDates = [];
            let openedDates = []
            futureDates.forEach(futureDate => {
                if (locationsPerDate.find(lpd => lpd.id_Date === futureDate.id) === undefined) {
                    closedDates.push(futureDate);
                } else {
                    openedDates.push(futureDate);
                }
            });

            setLeft(closedDates);
            setRight(openedDates);
        }
    }, [dates, locationsPerDate]);

    const customList = (dates) => (
        <Paper className={classes.paper}>
            <List dense component="div" role="list">
                {dates === undefined ? null : dates.map((date) => {
                    const labelId = `transfer-list-item-${date.id}-label`;

                    return (
                        <ListItem key={date.id} role="listitem" button onClick={handleToggle(date)}>
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.indexOf(date) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{'aria-labelledby': labelId}}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={formatDate(date.selected_Date)}/>
                        </ListItem>
                    );
                })}
                <ListItem/>
            </List>
        </Paper>

    );
    let postAddedDates = async (addedDates) => {

    };

    const handleOpenedDatesSubmit = (event) => {
        event.preventDefault();

        let datesToAdd = [];
        let datesToDelete = [];
        let currentIdLoc = null;
        let isOk = true;



        //Find which dates have been added in Open date and which ones have been removed
        const futureLocationsPerDate = locationsPerDate.filter(lpd => new Date(lpd.date.selected_Date) >= new Date().setHours(0, 0, 0, 0));

        futureLocationsPerDate.forEach(futureLPD => {
            if (right.find(rightDate => rightDate.id === futureLPD.id_Date) === undefined) {
                datesToDelete.push({
                    id_Location: location.id,
                    id_Date: futureLPD.id_Date
                });
            }
        });

        right.forEach(rightDate => {
            if (locationsPerDate.find(lpd => lpd.id_Date === rightDate.id) === undefined) {
                datesToAdd.push({
                    id_Location: location.id,
                    id_Date: rightDate.id
                });
            }
        });

        let fetchDelete = async () => {
            let token = await getAccessTokenSilently();
            let responseDelete = await fetch(`${process.env.REACT_APP_SERVER_URL}${endpoints.location_per_date}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    'Content-Type': "application/json",
                },
                body: JSON.stringify(datesToDelete)
            });
            if (responseDelete === null) {
                isOk = false;
            }
        }


        //If datesToDelete not empty, request to delete all dates in the list
        if (datesToDelete.length !== 0) {
            fetchDelete().catch();
        }

        //If datesToAdd not empty, request to dates all dates in the list
        if (datesToAdd.length !== 0) {
            let responseAdd = postRequest(`${process.env.REACT_APP_SERVER_URL}${endpoints.location_per_date}`,
                getAccessTokenSilently, JSON.stringify(datesToAdd));
            if (responseAdd === null) {
                isOk = false;
            }
        }
        handleModalClose(event);
        if (isOk) {

            enqueueSnackbar('Your opened dates have been registered ! Thank you !', {variant:"success"});
        } else {
            enqueueSnackbar('Oops ! Something went wrong. Please try again or contact the administrator(admin@opensunday.ch).', {variant:"error"});
        }

        console.log('datesToDelete', datesToDelete);
        console.log('datesToAdd', datesToAdd);


    }

    const handleModalClose = (event) => {

        setRight([]);
        setLeft([]);
        setDates([]);
        setLocationsPerDate([]);
        handleClose(event);
    };

    return (
        <>
            <Modal size="lg" show={showDefineDatesModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Define Opened Dates : {location.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
                        <Grid item>
                            <h3>Closed Dates</h3>
                            <Divider/>
                            {customList(left)}
                        </Grid>
                        <Grid item>
                            <Grid container direction="column" alignItems="center">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    className={classes.button}
                                    onClick={handleAllRight}
                                    disabled={left.length === 0}
                                    aria-label="move all right"
                                >
                                    ≫
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    className={classes.button}
                                    onClick={handleCheckedRight}
                                    disabled={leftChecked.length === 0}
                                    aria-label="move selected right"
                                >
                                    &gt;
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    className={classes.button}
                                    onClick={handleCheckedLeft}
                                    disabled={rightChecked.length === 0}
                                    aria-label="move selected left"
                                >
                                    &lt;
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    className={classes.button}
                                    onClick={handleAllLeft}
                                    disabled={right.length === 0}
                                    aria-label="move all left"
                                >
                                    ≪
                                </Button>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <h3>Opened Dates</h3>
                            <Divider/>
                            {customList(right)}
                        </Grid>
                    </Grid>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="contained" color="secondary" onClick={handleModalClose}
                            style={{marginRight: "0.2em"}}>
                        Close
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleOpenedDatesSubmit}>
                        Validate Opened Dates
                    </Button>
                </Modal.Footer>
            </Modal>
        </>

    );
}