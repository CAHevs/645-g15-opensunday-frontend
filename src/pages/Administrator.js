import React from "react";
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ManageLocation from "./ManageLocation";
import Box from '@material-ui/core/Box';
import UsersList from "../components/UsersList";
import ReportsList from "../components/ReportsList";

function TabPanel(props) {
    //Set panels
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            style={{height: "750px", overflow: 'hidden'}}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function Administrator() {

    //Create the state values
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        //Handle the change tab
        setValue(newValue);
    };

    return (
        <>
            <div className="administrator">
                <Paper >
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        aria-label="administratorTabs"
                        centered
                    >
                        <Tab label="Locations" />
                        <Tab label="Users" />
                        <Tab label="Reports" />
                    </Tabs>
                    <TabPanel value={value} index={0}>
                        <ManageLocation isAdmin={true}/>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <UsersList/>
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        <ReportsList/>
                    </TabPanel>
                </Paper>
            </div>

        </>
    );
}