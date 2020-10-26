import {Auth0Provider} from "@auth0/auth0-react";
import auth_config from "./auth_config";
import {UserContext} from "./utils/UserContext";
import App from "./App";
import React from "react";


class AppWrapper extends React.Component {
    /* Initialize state with 3 null components */
    constructor() {
        super();
        this.userAuthenticated = { userAuthenticated: null };
        this.userPosition = {userPosition: [null, null]};
    }

<<<<<<< HEAD
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


=======
>>>>>>> 47b1a1e31275b5e9b8f84781e5b7586b3f78c580
    render() {
        return (
            <Auth0Provider
                domain={auth_config.domain}
                clientId={auth_config.clientId}
                redirectUri={window.location.origin}
                audience={auth_config.audience}
                useRefreshTokens={true}
            >
                <UserContext.Provider value={{ userAuthenticated: null}, {userPosition:[null, null]}}>
                    <App className="App"/>
                </UserContext.Provider>

            </Auth0Provider>
        );
    }
}

export default AppWrapper;

