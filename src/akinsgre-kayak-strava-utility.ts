import axios from "axios";

import { Athlete, Token } from "./types/Token";
import _ from "lodash";
import Cookies from "js-cookie";
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

  if (!serviceConfig?.stravaUrl || serviceConfig.stravaUrl.length === 0) {
    throw new Error("Invalid Strava URL Config");
  }
  return serviceConfig;
}

export const authenticate = async (
  clientId: string,
  clientSecret: string
): Promise<Athlete> => {
  try {
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

      sessionStorage.setItem("accessToken", accessToken.toLocaleString());
      Cookies.set("token", JSON.stringify(token));

      const user: Athlete = {
        firstname: token.athlete.firstname,
        lastname: token.athlete.lastname,
        username: token.athlete.username,
        id: token.athlete.id,
      } as Athlete;
      return new Promise((resolve, reject) => {
        resolve(user);
      });
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

const testAuthGetter = async (
  authTok,
  clientId,
  clientSecret
): Promise<Token> => {
  try {
    const response = await axios.post(
      `https://www.strava.com/api/v3/oauth/token?client_id=${clientId}&client_secret=${clientSecret}&code=${authTok}&grant_type=authorization_code`
    );

    const retVal: Token = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expiry: response.data.expires_at,
      athlete: response.data.athlete,
    };

    return retVal;
  } catch (error) {}
};
