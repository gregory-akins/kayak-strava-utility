import axios from "axios";
import { Token } from "./types/Token";
import _ from "lodash";

export const getUserData = async (userID, accessToken) => {
  try {
    const response = await axios.get(
      `https://www.strava.com/api/v3/athletes/${userID}/stats`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response;
  } catch (error) {}
};

export const authenticate = async (
  path: string,
  REACT_APP_CLIENT_ID: string,
  REACT_APP_CLIENT_SECRET: string
) => {
  try {
    // If not redirected to Strava, return to home
    if (_.isEmpty(path)) {
      return "/";
    }

    // Save the Auth Token to the Store (it's located under 'search' for some reason)
    const stravaAuthToken = cleanUpAuthToken(location.search);

    // Post Request to Strava (with AuthToken) which returns Refresh Token and and Access Token
    const tokens = await testAuthGetter(
      stravaAuthToken,
      REACT_APP_CLIENT_ID,
      REACT_APP_CLIENT_SECRET
    );

    //props.setUser(tokens);
    const accessToken = tokens.access_token;

    const userID = tokens.athlete.id;
    localStorage.setItem("athlete", tokens.athlete.username);
    // Axios request to get users info
    const user = await getUserData(userID, accessToken);
    //props.setUserActivities(user);

    // Once complete, go to display page
    return "/yourdistance";
  } catch (error) {
    return "/";
  }
};

const cleanUpAuthToken = (str) => {
  return str.split("&")[1].slice(5);
};
const testAuthGetter = async (
  authTok,
  REACT_APP_CLIENT_ID,
  REACT_APP_CLIENT_SECRET
): Promise<Token> => {
  try {
    const response = await axios.post(
      `https://www.strava.com/api/v3/oauth/token?client_id=${REACT_APP_CLIENT_ID}&client_secret=${REACT_APP_CLIENT_SECRET}&code=${authTok}&grant_type=authorization_code`
    );
    return response.data;
  } catch (error) {}
};
