import React, {useEffect, useState} from "react";
import request from "../utils/request";
import endpoints from "../endpoints.json";
import {useAuth0} from "@auth0/auth0-react";

export default function ReportsList() {
    let [reports, setReports] = useState([]);
    let { getAccessTokenSilently } = useAuth0();

    useEffect(()=>{
        let getAllReports = async (e) => {
            let reportsResponse = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.user}`, getAccessTokenSilently);
            if (reportsResponse !== null) {
                setReports(reports);
            }

        }
        getAllReports().catch();

    }, []);

}