import React from 'react';

/* UserContext that will be used by the App */
export const UserContext = React.createContext({
    userAuthenticated: null ,
    userPosition: [null, null],
    setUserAuthenticated: () => {},
    setUserPosition: () => {}
});

