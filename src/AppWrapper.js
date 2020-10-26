import {Auth0Provider} from "@auth0/auth0-react";
import auth_config from "./auth_config";
import {UserContext} from "./utils/UserContext";
import App from "./App";
import React from "react";


class AppWrapper extends React.Component {
    /* Initialize state with 3 null components */
    constructor() {
        super();
        this.userAuthenticated = {userAuthenticated: null};
        this.userPosition = {userPosition: [null, null]};
    }


    // setUserAuthenticated = (user) => {
    //     this.setState((prevState) => ({
    //         userAuthenticated: user
    //     }));
    // };

    // setUserPosition = (user) => {
    //     this.setState((prevState) => ({
    //     //         navigator.geolocation.getCurrentPosition(function (position) {
    //     //             userContext.userPosition = [position.coords.longitude, position.coords.latitude]
    //     //         })
    //     //     };
    //     // }));
    // };

    render() {
        return (
            <Auth0Provider
                domain={auth_config.domain}
                clientId={auth_config.clientId}
                redirectUri={window.location.origin}
                audience={auth_config.audience}
                useRefreshTokens={true}
            >
                <UserContext.Provider value={{userAuthenticated: null, userPosition:null}}>
                <App className="App"/>
            </UserContext.Provider>

            </Auth0Provider>
        );
    }
}

export default AppWrapper;

