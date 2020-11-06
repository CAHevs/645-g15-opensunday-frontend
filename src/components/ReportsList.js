import React, {useEffect, useState} from "react";
import request from "../utils/request";
import endpoints from "../endpoints.json";
import {useAuth0} from "@auth0/auth0-react";
import {makeStyles} from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SimpleBar from "simplebar-react";
import {Grid} from "@material-ui/core";

//Create some styles
const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    name: {
        fontSize: theme.typography.pxToRem(17),
        flexBasis: '30%',
        flexShrink: 0,
        textAlign: 'left',

    },
    city: {
        fontSize: theme.typography.pxToRem(17),
        flexBasis: '15%',
        flexShrink: 0,
        textAlign: 'left',

    },
    comment: {
        fontSize: theme.typography.pxToRem(17),
        color: theme.palette.text.secondary,
    },
    details: {
        fontSize: theme.typography.pxToRem(16),
        color: theme.palette.text.secondary,
    },
    headerDetails: {
        fontSize: theme.typography.pxToRem(16),
        color: theme.palette.text.primary,
        fontWeight: "bold",
    },
}));

export default function ReportsList() {
    //Create the state values
    const [expanded, setExpanded] = React.useState(false);
    let [reports, setReports] = useState([]);

    //Hooks
    const {getAccessTokenSilently} = useAuth0();
    const classes = useStyles();

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    useEffect(() => {
        //Get all the reports sorted by report date
        let getAllReports = async (e) => {
            let reportsResponse = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.reporting}`, getAccessTokenSilently);
            if (reportsResponse !== null) {
                reportsResponse.sort((a, b) => {
                    return new Date(b.report_Date) - new Date(a.report_Date);
                });
                setReports(reportsResponse);
            }

        }
        getAllReports().catch();

    }, []);

    let formatDate = (selected_Date) => {
        //Format the date
        const date = Date.parse(selected_Date);
        return new Intl.DateTimeFormat('en-gb', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
    };

    return (
        <>
            <SimpleBar style={{maxHeight: "95%", height: "700px"}}>
                {reports.map((report, index) => (
                    <Accordion key={index} expanded={expanded === index} onChange={handleChange(index)}
                               style={{backgroundColor: "#f5f4f4"}}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                            aria-controls={index + "-content"}
                            id={index + "-header"}
                        >
                            <Typography className={classes.name}>{report.location.name}</Typography>
                            <Typography className={classes.city}>{report.location.city.name}</Typography>
                            <Typography className={classes.comment}>{report.comment}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid
                                container
                                direction="column"
                                alignItems="stretch"
                                justify="flex-start"
                            >
                                <Grid
                                    container
                                    direction="column"
                                    alignItems="flex-start"
                                    justify="flex-start"
                                >
                                    <Grid item>
                                        <Typography
                                            className={classes.headerDetails}>{report.location.type.description}</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography
                                            className={classes.details}>({report.location.id}) {report.location.name} - {report.location.address}, {report.location.city.code} {report.location.city.name}</Typography>
                                    </Grid>
                                </Grid>
                                <Grid
                                    container
                                    direction="column"
                                    alignItems="flex-start"
                                    justify="flex-start"
                                >
                                    <Grid item>
                                        <Typography className={classes.headerDetails}>User</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography
                                            className={classes.details}>({report.user.id}) {report.user.firstname} {report.user.lastname} - {report.user.email} {report.user.isBlocked ? "- Blocked" : null}</Typography>
                                    </Grid>


                                </Grid>
                                <Grid
                                    container
                                    direction="column"
                                    alignItems="flex-start"
                                    justify="flex-start"
                                >
                                    <Grid item>
                                        <Typography className={classes.headerDetails}>Visit Date</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography
                                            className={classes.details}>{formatDate(report.date.selected_Date)}</Typography>
                                    </Grid>

                                </Grid>
                                <Grid
                                    container
                                    direction="column"
                                    alignItems="flex-start"
                                    justify="flex-start"
                                >
                                    <Grid item>
                                        <Typography className={classes.headerDetails}>Report Date</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography
                                            className={classes.details}>{formatDate(report.report_Date)}</Typography>
                                    </Grid>

                                </Grid>
                                <Grid
                                    container
                                    direction="column"
                                    alignItems="flex-start"
                                    justify="flex-start"
                                >
                                    <Grid item>
                                        <Typography className={classes.headerDetails}>Comment</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography
                                            className={classes.details}>{report.comment}</Typography>
                                    </Grid>

                                </Grid>
                            </Grid>

                        </AccordionDetails>
                    </Accordion>
                ))}

            </SimpleBar>
        </>
    );

}