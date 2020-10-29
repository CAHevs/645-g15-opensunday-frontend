import React, {useContext, useEffect, useState} from "react";
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
import {Formik} from 'formik';
import {UserContext} from "../utils/UserContext";
import Form from 'react-bootstrap/Form'
import postRequest from "../utils/postRequest";
import * as Yup from 'yup';
import AddIcon from '@material-ui/icons/Add';


export default function LocationsList(props) {
    let locations = props.locations;

    let [rate, setRate] = useState(null);
    const [expanded, setExpanded] = React.useState(false);
    let [locationPerDate, setLocationPerDate] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    let [locationToReport, setLocationToReport] = useState(null);
    let [average, setAverage] = useState(null);
    let [filteredPastDates, setFilteredPastDates] = useState(null);
    let [filteredFutureDates, setFilteredFutureDates] = useState(null);
    let [showSendRating, setShowSendRating] = useState(false);

    const userContext = useContext(UserContext);

    const reportingValidationSchema = Yup.object({
        Comment: Yup.string().required()
    });

    const handleRatingChange = (event, newRate) => {
        event.preventDefault();
        setRate(newRate);
        setShowSendRating(true);
    }

    const handleClose = () => {
        setShowReportModal(false);
        setLocationToReport(null);
        setFilteredPastDates(null);
    };

    let {
        getAccessTokenSilently,
    } = useAuth0();
    let getLocation_per_Date = async (locationId) => {
        let locationPerDate = await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.location_per_date}/${locationId}/byLocation`,
            getAccessTokenSilently);
        if (locationPerDate === 404)
            return;
        setLocationPerDate(locationPerDate);
        filterFutureDates(locationPerDate);

    };
    let getAverageRatingForLocation = async (locationId) => {
        let response = await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.rating}/${locationId}/averagebylocation`,
            getAccessTokenSilently);
        if (response === 404)
            return;
        response.average = Math.round(response.average*10)/10;
        setAverage(response);

    };

    const handleChange =  (event, locationId, isExpanded) => {
        event.preventDefault();
        async function fetchLocation_per_Date() {
            await getLocation_per_Date(locationId);
            await getAverageRatingForLocation(locationId);
        }
        if (isExpanded) {
            fetchLocation_per_Date().catch();
            console.log("4filteredFutureDates : " + filteredFutureDates);
        } else {
            setFilteredFutureDates(null);
            filteredFutureDates = null;
        }
        setExpanded(isExpanded ? locationId : false);
    };
    let formatDate = (selected_Date) => {
        const date = Date.parse(selected_Date);
        return new Intl.DateTimeFormat('en-gb', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
    };

    const handleReportClick = (loc) => (event) => {
        event.preventDefault();
        setLocationToReport(loc);
        filterPastDates();
        //console.log("4filteredPastDate"+filteredPastDates);

        if (filteredPastDates === null) {
            alert("A report for this location is not possible");
        } else {
            setShowReportModal(true);
        }
    };
    const handleReportSubmit = async (report) => {
        report.Report_Date = new Date().toISOString();
        console.log('report to post',report)

        let response = await postRequest(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.reporting}`,
            getAccessTokenSilently, JSON.stringify(report));

        if (response === 409) {
            handleClose();
            return alert("You already reported something for this location and this date! Please choose another date.");
        }

        console.log("Successfully added this new report: " + report);
        handleClose();
        return alert("Your report has successfully been transmitted. Thank you !");
    }
    let filterPastDates = () => {
        let pastDates = [];
        //console.log("1loc :"+locationPerDate);
        if (locationPerDate.length === 0)
            return;
        locationPerDate.forEach((openedDate) => {
            if (new Date(openedDate.date.selected_Date) <= new Date().setHours(0, 0, 0, 0)) {
                pastDates.push(openedDate.date);
            }
        });
        //console.log("2pastdates :"+pastDates);
        if (pastDates.length !== 0) {
            pastDates.sort((a, b) => {
                return a - b;
            });
            setFilteredPastDates(pastDates);
            filteredPastDates = pastDates;
            //console.log("3filteredPastDates : "+filteredPastDates);
        }
    }

    let filterFutureDates = (locationPerDate) => {
        let futureDates = [];
        //console.log("1loc :" + locationPerDate);
        if (locationPerDate.length === 0) {
            setFilteredFutureDates(null);
            filteredFutureDates = null;
            return;
        }

        futureDates = locationPerDate.filter(a => new Date(a.date.selected_Date) >= new Date().setHours(0, 0, 0, 0));
        //console.log("2futuredates :" + futureDates);
        if (futureDates !== null) {
            futureDates.sort((a, b) => {
                return a + b;
            });
            setFilteredFutureDates(futureDates);
            filteredFutureDates = futureDates;
            //console.log("3filteredFutureDates : " + filteredFutureDates);
        }
    }


    return (
        <>
            {locations.map((loc, index) => (
                <Accordion key={index} expanded={expanded === loc.id} onChange={(event, isExpanded) => handleChange(event, loc.id, isExpanded)}>
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
                                overflowY: "auto",
                                width: "100%"
                            }}>
                                {filteredFutureDates === null ? (<p>No future opened dates
                                    registered</p>) : filteredFutureDates.map((openedDate, index) => (
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

                           <div style={{alignContent:"center"}}>
                               {average != null ? (<p>{average.average} ({average.nbRatings})</p>):null}
                               <Box component="fieldset" mb={3} borderColor="transparent" style={{display: "inline-block"}}>

                                   <Rating
                                       name="customized-empty"
                                       defaultValue={0}
                                       value={rate}
                                       onChange={handleRatingChange}
                                   />
                               </Box>
                           </div>

                            <Link to="#" onClick={handleReportClick(loc)}>
                                Report
                            </Link>


                        </div>

                    </AccordionDetails>
                </Accordion>
            ))}
            {locationToReport == null ? null : (
                <Formik
                    initialValues={{
                    Id_Location: locationToReport.id,
                    Id_User: userContext.userAuthenticated.id,
                    Report_Date: null,
                    Comment: "",
                    Id_Date: null
                }}
                    onSubmit={(values) => handleReportSubmit(values)}
                    validationSchema={reportingValidationSchema}>
                    {({
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          values,
                          touched,
                          isValid,
                          errors
                      }) => (
                        <Modal show={showReportModal} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title>Report : {locationToReport.name}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Form.Label>
                                        When went you to {locationToReport.name} ?
                                    </Form.Label>
                                    <Form.Control as="select" onChange={handleChange("Id_Date")}>
                                        {filteredPastDates === null ? (
                                            <option/>) : filteredPastDates.map((pastDate, index) => (
                                            <option key={index} value={pastDate.id}
                                                    label={formatDate(pastDate.selected_Date)}>
                                                {values.Id_Date === null ? values.Id_Date = pastDate.id : null}
                                            </option>
                                        ))
                                        }
                                    </Form.Control>
                                    <Form.Label>
                                        Comment
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        onChange={handleChange('Comment')}
                                        onBlur={handleBlur('Comment')}
                                        value={values.comment}
                                        isInvalid={!!errors.Comment}
                                        placeholder="What do you want to report ? (Ex: The restaurant was closed...)"/>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.Comment}
                                    </Form.Control.Feedback>
                                </Form>

                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="contained" color="secondary" onClick={handleClose}
                                        style={{marginRight: "0.2em"}}>
                                    Close
                                </Button>
                                <Button variant="contained" color="primary" onClick={handleSubmit}>
                                    Send Report
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    )}
                </Formik>
            )}

        </>

    );
}