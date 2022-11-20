import axios from "axios";

import { Athlete, Token } from "./types/Token";
import _ from "lodash";
import { clearConfigCache } from "prettier";
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

export const getUserData = async (
  userID: number,
  accessToken: number
): Promise<Athlete> => {
  const response = await axios.get(
    `https://www.strava.com/api/v3/athletes/${userID}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const result: Athlete = {
    firstname: response.data.firstname,
    lastname: response.data.lastname,
    username: response.data.username,
    id: response.data.id,
  };
  return result;
};

export const authenticate = async (
  clientId: string,
  clientSecret: string
): Promise<Athlete> => {
  try {
    // if (_.isEmpty(path)) {
    //   return "/";
    // }

    // Save the Auth Token to the Store (it's located under 'search' for some reason)

    if (!location.search || location.search.split("&").length < 2) {
      return undefined;
    } else {
      const stravaAuthToken = cleanUpAuthToken(location.search);
      //Post Request to Strava (with AuthToken) which returns Refresh Token and and Access Token
      const token: Token = await testAuthGetter(
        stravaAuthToken,
        clientId,
        clientSecret
      );
      const accessToken = token.access_token;
      sessionStorage.setItem("userName", JSON.stringify(token.athlete));
      sessionStorage.setItem("accessToken", accessToken.toLocaleString());
      const user: Athlete = await getUserData(token.athlete.id, accessToken);

      return user;
    }
  } catch (error) {
    return undefined;
  }
};

const cleanUpAuthToken = (str) => {
  var search = str.substring(1);
  const param = JSON.parse(
    '{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
    function (key, value) {
      return key === "" ? value : decodeURIComponent(value);
    }
  );
  return param["code"];
};

export const testAuthGetter = async (
  authTok,
  clientId,
  clientSecret
): Promise<Token> => {
  try {
    const response = await axios.post(
      `https://www.strava.com/api/v3/oauth/token?client_id=${clientId}&client_secret=${clientSecret}&code=${authTok}&grant_type=authorization_code`
    );
    const retVal: Token = response.data;
    return retVal;
  } catch (error) {}
};
