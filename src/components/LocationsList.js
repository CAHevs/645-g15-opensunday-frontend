import React, {useContext, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import request from "../utils/request";
import endpoints from "../endpoints.json";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Box from "@material-ui/core/Box";
import Rating from "@material-ui/lab/Rating";
import Accordion from "@material-ui/core/Accordion";
import Modal from "react-bootstrap/Modal";
import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import { Formik, Form } from 'formik';
import {UserContext} from "../utils/UserContext";


export default function LocationsList(props) {
    let locations = props.locations;

    let [rate, setRate] = useState(null);
    const [expanded, setExpanded] = React.useState(false);
    let [locationPerDate, setLocationPerDate] = useState([]);
    let [isLoaded, setIsLoaded] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    let [locationToReport, setLocationToReport] = useState(null);

    const userContext = useContext(UserContext);

    const handleClose = () => {
        setShowReportModal(false);
        setLocationToReport(null);
    };

    let {
        loginWithRedirect,
        getAccessTokenSilently,
    } = useAuth0();
    let getLocation_per_Date = async (locationId) => {
        setIsLoaded(false);
        let locationPerDate = await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.location_per_date}/${locationId}/byLocation`,
            getAccessTokenSilently,
            loginWithRedirect)
        setLocationPerDate(locationPerDate);
        setIsLoaded(true);
    };
    const handleChange = (locationId) => (event, isExpanded) => {
        setExpanded(isExpanded ? locationId : false);

        async function fetchLocation_per_Date() {
            await getLocation_per_Date(locationId);
        }

        fetchLocation_per_Date();
    };
    let formatDate = (selected_Date) => {
        const date = new Date(selected_Date);
        return new Intl.DateTimeFormat('en-gb', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
    };

    const handleReportClick = (loc) => (event)=>{
        setShowReportModal(true);
        setLocationToReport(loc);
    };
    const handleReportSubmit = async (report, event) =>{

    }


    return (
        <>
            {locations.map((loc, index) => (
                <Accordion key={index} expanded={expanded === loc.id} onChange={handleChange(loc.id)}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls={loc.id + "bh-content"}
                        id={loc.id + "bh-content"}
                    >
                        <div className="accordion-summary">
                            {loc.name} ({loc.type.description})
                        </div>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className="accordion-detail" style={{width: "100%"}}>
                            <p style={{fontWeight: "bold"}}>
                                Opened dates
                            </p>
                            <ul style={{
                                listStyleType: 'none',
                                display: "inline-block",
                                padding: 0,
                                maxHeight: 100,
                                overflowY: "scroll",
                                width: "100%"
                            }}>
                                {locationPerDate.map((openedDate, index) => (
                                    <li key={index} style={{display: "inline-block", width: "100%"}}>
                                        <div>
                                            <p style={{color: "green"}}>
                                                {formatDate(openedDate.date.selected_Date)}
                                            </p>
                                        </div>
                                    </li>
                                ))}

                            </ul>
                            <p style={{fontWeight: "bold"}}>
                                Address
                            </p>
                            <p>
                                {loc.address}
                            </p>
                            <p>
                                {loc.city.code} {loc.city.name}
                            </p>

                            <Box component="fieldset" mb={3} borderColor="transparent">
                                <Rating
                                    name="customized-empty"
                                    defaultValue={2}
                                    value={rate}
                                    onChange={(event, newRate) => {
                                        setRate(newRate);
                                    }}
                                />
                            </Box>
                            <Link onClick={handleReportClick(loc)}>
                                Report
                            </Link>


                        </div>

                    </AccordionDetails>
                </Accordion>
            ))}
            {locationToReport == null ? null : (
                <Modal show={showReportModal} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Report location</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                       <p>
                           {locationToReport.name}
                           {console.log(userContext.userAuthenticated.id)}
                           {userContext.userAuthenticated.lastname}
                       </p>

                        <Formik initialValues={{
                        id_Location: locationToReport.id,
                        Id_User: userContext.userAuthenticated.id,
                        Report_Date: "",
                        Comment:"",
                        Id_Date: null
                        }} onSubmit={handleReportSubmit}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="contained" color="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleClose}>
                            Send Report
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

        </>

    );
}