import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "@material-ui/core/Button";
import {Formik} from "formik";
import React, {useContext} from "react";
import postRequest from "../utils/postRequest";
import endpoints from "../endpoints.json";
import * as Yup from "yup";
import {UserContext} from "../utils/UserContext";
import {useAuth0} from "@auth0/auth0-react";


export default function ReportModal(props) {
    let locationToReport = props.locationToReport;
    let handleClose = props.handleClose;
    let showReportModal = props.showReportModal;
    let filteredPastDates = props.filteredPastDate;
    let formatDate = props.formatDate;

    let {getAccessTokenSilently} = useAuth0();

    let userContext = useContext(UserContext);

    const reportingValidationSchema = Yup.object({
        Comment: Yup.string().required()
    });

    const handleReportSubmit = async (report) => {
        report.Report_Date = new Date().toISOString();
        console.log('report to post', report)

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

    return (
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
    );
}