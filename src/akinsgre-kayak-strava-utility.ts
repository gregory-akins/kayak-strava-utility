import axios from "axios";
import { Token } from "./types/Token";
import _ from "lodash";
axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
export interface ServiceConfig {
  stravaUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
}

export async function useServiceConfig(): Promise<ServiceConfig> {
  const serviceConfig: ServiceConfig = (
    await axios.get<ServiceConfig>("/importmap/config.json")
  ).data;

  if (!serviceConfig?.stravaUrl) {
    throw new Error("Invalid Strava URL Config");
  }
  return serviceConfig;
}

export const getUserData = (userID: number, accessToken: number): void => {
  try {
    const response = axios.get(
      `https://www.strava.com/api/v3/athletes/${userID}/stats`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  } catch (error) {}
};

export const authenticate = async (
  path: string,
  clientId: string,
  clientSecret: string
): Promise<string> => {
  try {
    // if (_.isEmpty(path)) {
    //   return "/";
    // }

    // Save the Auth Token to the Store (it's located under 'search' for some reason)
    const stravaAuthToken = cleanUpAuthToken(location.search);
    //Post Request to Strava (with AuthToken) which returns Refresh Token and and Access Token
    const token: Token = await testAuthGetter(
      stravaAuthToken,
      clientId,
      clientSecret
    );
    //why aren't we waiting on this?

    const accessToken = token.access_token;
    const userID = token.athlete.id;

    localStorage.setItem("username", token.athlete.username);
    localStorage.setItem("accessToken", accessToken.toLocaleString());
    // Axios request to get users info
    const user = await getUserData(userID, accessToken);
    // Once complete, go to display page
    return "/yourdistance";
  } catch (error) {
    return "/";
  }
};

const cleanUpAuthToken = (str) => {
  return str.split("&")[1].slice(5);
};
export const testAuthGetter = async (
  authTok,
  REACT_APP_CLIENT_ID,
  REACT_APP_CLIENT_SECRET
): Promise<Token> => {
  let retVal: Token;
  try {
    const response = await axios
      .post(
        `https://www.strava.com/api/v3/oauth/token?client_id=${REACT_APP_CLIENT_ID}&client_secret=${REACT_APP_CLIENT_SECRET}&code=${authTok}&grant_type=authorization_code`
      )
      .then(async (response) => {
        retVal = response.data;
      })
      .catch(() => console.error);
    return retVal;
  } catch (error) {}
};
