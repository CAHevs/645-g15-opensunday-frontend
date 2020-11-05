import {Auth0Provider} from "@auth0/auth0-react";
import auth_config from "./auth_config";
import {UserContext} from "./utils/UserContext";
import App from "./App";
import React from "react";
import {SnackbarProvider, useSnackbar} from 'notistack';


class AppWrapper extends React.Component {
    /* Initialize state with 1 null components */
    constructor() {
        super();
        this.state = {
            userAuthenticated: null,
            userPosition: null
        };
    }

    setUserPosition = (userPosition) => {
        this.setState({
            userPosition: userPosition
        });
    };
    setUserAuthenticated = (user) => {
        this.setState({
            userAuthenticated: user
        });
    };

    render() {
        return (
            <Auth0Provider
                domain={auth_config.domain}
                clientId={auth_config.clientId}
                redirectUri={window.location.origin}
                audience={auth_config.audience}
                useRefreshTokens={true}
            >
                <UserContext.Provider
                    value={{
                        userAuthenticated: this.state.userAuthenticated,
                        userPosition: this.state.userPosition,
                        setUserAuthenticated: this.setUserAuthenticated,
                        setUserPosition: this.setUserPosition
                    }}>
                    <SnackbarProvider maxSnack={5}>
                        <App className="App"/>
                    </SnackbarProvider>
                </UserContext.Provider>

            </Auth0Provider>
        );
    }
}

export default AppWrapper;

