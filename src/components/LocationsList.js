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
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from '@material-ui/icons/Check';
import {useHistory, useParams} from "react-router-dom";
import ReportModal from "./ReportModal";
import AddLocationModal from "./AddLocationModal";


export default function LocationsList(props) {
    let locations = props.locations;

    let [rating, setRating] = useState(null);
    let [expanded, setExpanded] = React.useState(false);
    let [locationPerDate, setLocationPerDate] = useState([]);
    let [showReportModal, setShowReportModal] = useState(false);
    let [locationToReport, setLocationToReport] = useState(null);
    let [average, setAverage] = useState(null);
    let [filteredPastDates, setFilteredPastDates] = useState(null);
    let [filteredFutureDates, setFilteredFutureDates] = useState(null);
    let [showSendRating, setShowSendRating] = useState(false);
    let [locationToShow, setLocationToShow] = useState(null);
    let [disabledRating, setDisabledRating] = useState(false);


    const userContext = useContext(UserContext);
    const history = useHistory();

    let {locationId} = useParams();

    const refs = locations.reduce((acc, value) => {
        acc[value.id] = React.createRef();
        return acc;
    }, {});

    const scrollToItem = id =>
        refs[id].current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });

    useEffect(() => {
        if (locationId === undefined) {
            return;
        }
        let locationSelected = locations.find(location => location.id === +locationId);
        const event = new Event('onchange');
        handleChange(event, locationSelected, true);
        scrollToItem(locationSelected.id);
    }, [locationId]);


    useEffect(() => {
        if (locationToReport === null)
            return;

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
                    return new Date(b.selected_Date) - new Date(a.selected_Date);
                });
                setFilteredPastDates(pastDates);
                filteredPastDates = pastDates;
                //console.log("3filteredPastDates : "+filteredPastDates);
            }
        }


        filterPastDates();

        if (filteredPastDates === null) {
            handleClose();
            alert("A report for this location is not possible");
        } else {
            setShowReportModal(true);
        }
    }, [locationToReport]);

    useEffect(() => {
        if (locationPerDate === null)
            return;
        let filterFutureDates = () => {
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
                    return new Date(a.selected_Date) - new Date(b.selected_Date);
                });
                setFilteredFutureDates(futureDates);
                //console.log("3filteredFutureDates : " + filteredFutureDates);
            }
        }

        filterFutureDates();
    }, [locationPerDate]);

    const handleRatingChange = (event, newRate) => {
        event.preventDefault();
        setRating(newRate);
        setShowSendRating(true);
    }

    let getRatingByUser = async (locationToShowId, userId) => {
        let response = await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.rating}/${locationToShowId}/${userId}`,
            getAccessTokenSilently);
        if (response === 404)
            return;
        setRating(response.rate);
        setDisabledRating(true);
    };

    const handleSendRating = async (event) => {
        event.preventDefault();
        const rateToPost = {
            rate: rating,
            id_Location: locationToShow.id,
            id_User: userContext.userAuthenticated.id
        }
        let response = await postRequest(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.rating}`,
            getAccessTokenSilently, JSON.stringify(rateToPost));

        if (response === 409) {
            return alert("You have already done a rating for this location");
        }

        setShowSendRating(false);
        setDisabledRating(false);
        await getAverageRatingForLocation(locationToShow.id);
        await getRatingByUser(locationToShow.id, userContext.userAuthenticated.id);
        return alert("Your rating has successfully been transmitted. Thank you !");
    }

    const handleClose = () => {
        setShowReportModal(false);
        setLocationToReport(null);
        setFilteredPastDates(null);
        setShowSendRating(false);
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
    };
    let getAverageRatingForLocation = async (locationId) => {
        let response = await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.rating}/${locationId}/averagebylocation`,
            getAccessTokenSilently);
        if (response === 404)
            return;
        response.average = Math.round(response.average * 10) / 10;
        setAverage(response);
    };

    const handleChange = (event, loc, isExpanded) => {
        event.preventDefault();
        setShowSendRating(false);
        setRating(null);
        setDisabledRating(false);

        async function fetchLocation_per_Date() {
            await getLocation_per_Date(loc.id);
            await getAverageRatingForLocation(loc.id);
            if(userContext.userAuthenticated !== null){
                await getRatingByUser(loc.id, userContext.userAuthenticated.id);
            }

        }

        if (isExpanded) {
            fetchLocation_per_Date().catch();
            setLocationToShow(loc);
            history.push("/location/" + loc.id);
        } else {
            setFilteredFutureDates(null);
            filteredFutureDates = null;
            setLocationToReport(null);
            setLocationToShow(null);
        }
        setExpanded(isExpanded ? loc.id : false);
    };
    let formatDate = (selected_Date) => {
        const date = Date.parse(selected_Date);
        return new Intl.DateTimeFormat('en-gb', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
    };

    const handleReportClick = (event, loc) => {
        event.preventDefault();
        setLocationToReport(loc);

    };


    return (
        <>
            {locations.map((loc) => (
                <Accordion key={loc.id} ref={refs[loc.id]} expanded={expanded === loc.id}
                           onChange={(event, isExpanded) => handleChange(event, loc, isExpanded)}>
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
                            <table style={{alignContent: "center"}}>
                                <tbody>
                                <tr>
                                    <td style={{verticalAlign:"middle", color: "#ffb400"}}>
                                        {average != null ? (<>{average.average} ({average.nbRatings})</>) : null}
                                    </td>
                                    <td >
                                        <div style={{display:"table-cell", verticalAlign:"bottom"}}>
                                            <Rating
                                                name="ratings"
                                                defaultValue={0}
                                                value={rating}
                                                max={5}
                                                onChange={handleRatingChange}
                                                disabled={disabledRating}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        {showSendRating ?
                                            <IconButton size="small" aria-label="Send my rating"
                                                        onClick={handleSendRating}>
                                                <CheckIcon style={{color: "green"}}/>
                                            </IconButton> : null}
                                    </td>
                                </tr>
                                </tbody>
                            </table>

                            <div>
                                <a href={loc.url}>
                                    See website
                                </a>
                            </div>


                            <Link to="#" onClick={(event) => handleReportClick(event, loc)}>
                                Report
                            </Link>


                        </div>

                    </AccordionDetails>
                </Accordion>
            ))}
            {showReportModal ? (
                <ReportModal showReportModal={showReportModal}
                             handleClose={handleClose}
                             locationToReport={locationToReport}
                             formatDate={formatDate}
                             filteredPastDate={filteredPastDates}
                />
            ) : null }

        </>

    );
}