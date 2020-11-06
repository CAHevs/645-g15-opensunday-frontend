import React, {useContext, useEffect, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import request from "../utils/request";
import endpoints from "../endpoints.json";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Rating from "@material-ui/lab/Rating";
import Accordion from "@material-ui/core/Accordion";
import {Link} from "react-router-dom";
import {UserContext} from "../utils/UserContext";
import postRequest from "../utils/postRequest";
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from '@material-ui/icons/Check';
import {useHistory, useParams} from "react-router-dom";
import ReportModal from "./ReportModal";
import {useSnackbar} from "notistack";
import Restaurant from '../assets/RestaurantPin.png';
import Bar from '../assets/BarPin.png';
import Museum from '../assets/MuseumPin.png';
import Theater from '../assets/TheaterPin.png';
import Cinema from '../assets/CinemaPin.png';


export default function LocationsList(props) {
    //Get the locations list from the props
    let locations = props.locations;

    //Create state variables
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

    //Use Hooks
    const { enqueueSnackbar } = useSnackbar();
    const userContext = useContext(UserContext);
    const history = useHistory();
    const { getAccessTokenSilently } = useAuth0();

    //Get the id given in the url
    let {locationId} = useParams();

    //Create refs for each location and store them
    const refs = locations.reduce((acc, value) => {
        acc[value.id] = React.createRef();
        return acc;
    }, {});


    useEffect(() => {
        //Check if the location id is existing
        if (locationId === undefined) {
            return;
        }
        //Select the location given in the params
        let locationSelected = locations.find(location => location.id === +locationId);
        const event = new Event('onchange');
        handleChange(event, locationSelected, true);
    }, [locationId]);


    useEffect(() => {
        //Check if the location to report is null
        if (locationToReport === null)
            return;

        //Keep only the past dates and today from the location per date to render them in the select date of the report
        let filterPastDates = () => {
            let pastDates = [];
            if (locationPerDate.length === 0)
                return;
            locationPerDate.forEach((openedDate) => {
                if (new Date(openedDate.date.selected_Date) <= new Date().setHours(0, 0, 0, 0)) {
                    pastDates.push(openedDate.date);
                }
            });
            if (pastDates.length !== 0) {
                //Sort them
                pastDates.sort((a, b) => {
                    return new Date(b.selected_Date) - new Date(a.selected_Date);
                });
                setFilteredPastDates(pastDates);
                filteredPastDates = pastDates;
            }
        }

        filterPastDates();

        if (filteredPastDates === null) {
            handleClose();
            //If no past dates exists, don't let do a report
            enqueueSnackbar('A report for this location is not possible', {variant: 'warning'})
        } else {
            //Show the report modal
            setShowReportModal(true);
        }
    }, [locationToReport]);

    useEffect(() => {
        if (locationPerDate === null)
            return;

        //Keep only the date of today and future dates to show them in the details of the location
        let filterFutureDates = () => {
            let futureDates = [];
            if (locationPerDate.length === 0) {
                setFilteredFutureDates(null);
                filteredFutureDates = null;
                return;
            }

            futureDates = locationPerDate.filter(a => new Date(a.date.selected_Date) >= new Date().setHours(0, 0, 0, 0));
            if (futureDates !== null) {
                futureDates.sort((a, b) => {
                    return new Date(a.selected_Date) - new Date(b.selected_Date); //Sort them
                });
                setFilteredFutureDates(futureDates);
            }
        }

        filterFutureDates();
    }, [locationPerDate]);

    const handleRatingChange = (event, newRate) => {
        //Set the new rating selected and show the button to register it
        event.preventDefault();
        setRating(newRate);
        setShowSendRating(true);
    }

    let getRatingByUser = async (locationToShowId, userId) => {
        //Get the ratings for a specific user
        let response = await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.rating}/${locationToShowId}/${userId}`,
            getAccessTokenSilently);
        if (response === 404)
            return;
        setRating(response.rate);
        setDisabledRating(true);
    };

    const handleSendRating = async (event) => {
        //Post the rating to the backend
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
            return enqueueSnackbar('You have already done a rating for this location', {variant: 'warning'});
        }
        //Reinitialize the view
        setShowSendRating(false);
        setDisabledRating(false);
        await getAverageRatingForLocation(locationToShow.id);
        await getRatingByUser(locationToShow.id, userContext.userAuthenticated.id);
        return enqueueSnackbar('Your rating has successfully been transmitted. Thank you !', {variant: 'success'});
    }

    const handleClose = () => {
        //Close all the modals and reset the values
        setShowReportModal(false);
        setLocationToReport(null);
        setFilteredPastDates(null);
        setShowSendRating(false);
    };


    let getLocation_per_Date = async (locationId) => {
        //Get the locations per date for specific location
        let locationPerDate = await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.location_per_date}/${locationId}/byLocation`,
            getAccessTokenSilently);
        if (locationPerDate === 404)
            return;
        setLocationPerDate(locationPerDate);
    };
    let getAverageRatingForLocation = async (locationId) => {
        //Get the average rating for a specific location
        let response = await request(
            `${process.env.REACT_APP_SERVER_URL}${endpoints.rating}/${locationId}/averagebylocation`,
            getAccessTokenSilently);
        if (response === 404)
            return;
        //Keep a rounded value
        response.average = Math.round(response.average * 10) / 10;
        setAverage(response);
    };

    const handleChange = (event, loc, isExpanded) => {
        //Get the values when a location's accordion is expanded
        event.preventDefault();
        setShowSendRating(false);
        setRating(null);
        setDisabledRating(false);

        async function fetchLocation_per_Date() {
            //Get the location per date, the average rating and the user's authenticated rating for the location expanded
            await getLocation_per_Date(loc.id);
            await getAverageRatingForLocation(loc.id);
            if(userContext.userAuthenticated !== null){
                await getRatingByUser(loc.id, userContext.userAuthenticated.id);
            }

        }

        if (isExpanded) {
            //Set the location to show and modify the url by sending the id of the location
            fetchLocation_per_Date().catch();
            setLocationToShow(loc);
            history.push("/location/" + loc.id);
        } else {
            //Reinitialize all the value when the location details are closed
            setFilteredFutureDates(null);
            filteredFutureDates = null;
            setLocationToReport(null);
            setLocationToShow(null);
        }
        setExpanded(isExpanded ? loc.id : false);
    };
    let formatDate = (selected_Date) => {
        //Format the date
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
                            {loc.type.description === "Bar" &&
                            <img src={Bar} width="40" height="40"/>
                            }
                            {loc.type.description === "Restaurant" &&
                            <img src={Restaurant} width="40" height="40"/>
                            }
                            {loc.type.description === "Museum" &&
                            <img src={Museum} width="40" height="40"/>
                            }
                            {loc.type.description === "Theater" &&
                            <img src={Theater} width="40" height="40"/>
                            }
                            {loc.type.description === "Cinema" &&
                            <img src={Cinema} width="40" height="40"/>
                            }
                            {loc.name}
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