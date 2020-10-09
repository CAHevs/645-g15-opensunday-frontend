import React, { useState } from "react";
import "./App.css";
import { useAuth0 } from "@auth0/auth0-react";
import request from "./utils/request";
import endpoints from "./endpoints";
import Loading from "./components/Loading";
import { BrowserRouter, Link, Switch, Route, Redirect } from "react-router-dom";
import LocationDetails from "./pages/LocationDetails";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
import UserForm from "./UserForm"


function App() {
  let [locations, setLocations] = useState([]);

  const [selectedDate, setSelectedDate] = useState(null);

  let [user, setUsers] = useState([]);

  //Get the city from the user's localization
  let city = "Sion";

  {
    // const sunHolidDays = [{date: '20/10'}, {date: '21/10'},
    // {date: '22/10'}, {date: '23/10'},
    // {date: '24/10'}, {date: '24/10'}]

    //list of sundays and holidays
    // const holiSunday = date => {
    //   const day = getDay(date);
    //   return day ;
    // };


    //list of sundays and holidays
    // const holiSunday = date => {
    //   const day = getDay(date);
    //   return day !== 0 && day !== 6;
    // };
  }


  //Authentification with Auth0
  let {
    loading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    isAuthenticated,
  } = useAuth0();



  //Login button with authentification
  let handleLoginClick = async (e) => {
    e.preventDefault();
    let locations = await request(
      `${process.env.REACT_APP_SERVER_URL}${endpoints.locations}`,
      getAccessTokenSilently,
      loginWithRedirect
    );

    //test if the user exists
    // if (true) {
    //   return <Redirect push to="./userform" />;

    // }

  };

  let handleLogoutClick = async (e) => {
    e.preventDefault();
    /*
    returnTo parameter is necessary because multiple apps use the same authentication backend
    */
    logout({ returnTo: window.location.origin });
  };

  if (loading) {
    return <Loading />;
  }



  let addUser = (user) => {
    setUsers((prevUsers) => [user, ...prevUsers]);
  };


  return (
    <div className="App">
      <header className="App-header">
        {isAuthenticated ? (
          /*If the user is authenticated*/
          <a
            className="App-link Logout-link"
            href="#"
            onClick={handleLogoutClick}
          >Logout
          </a>

        ) :
          /*if the user isn't authenticated */
          <a className="App-link Logout-link"
            href="#"
            onClick={handleLoginClick}
          >Login
          </a>
        }

        <h1>Welcome, login then select a town and a date</h1>

        <input
          //fieldRef={this.titleInputRef}
          type="text"
          name="city"
          value={city}
        // onChange={this.handleFormChange}
        //placeholder="Title"
        >
        </input>


        <DatePicker
          selected={selectedDate}
          onChange={date => setSelectedDate(date)}
          filterDate={date => date.getDay() == 0}
          //filterDate={sunHolidDays}
          minDate={new Date()}
          placeholderText="Select a sunday or holiday"
        />

        <BrowserRouter>
          <Switch>
            <Route
              path="/"
              exact
              render={() => (
                <>

                  {/* user != null
                  ici on vérifie que le user exite dans notre db */}
                  {isAuthenticated ? (
                    <ul className="Map">
                      <Link
                        className="App-Map"
                        to="/Map"
                      //onClick={}
                      >
                        <button>
                          map me
                        </button>

                      </Link>
                    </ul>
                  ) :
                    (


                      //à changer !!!!!!!!!
                      //si le user n'existe pas, il doit remplir le userform
                      <>
                        {/* <Redirect push to="./userform" />; */}

                      </>

                    )}
                </>
              )}
            />

          </Switch>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
