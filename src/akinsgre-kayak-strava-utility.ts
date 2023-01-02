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

      persistToken(token);

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

export const refreshAuth = async (): Promise<Token> => {
  const token: Token = JSON.parse(Cookies.get<Token>("token"));
  const refreshToken: string = token.refresh_token;
  if (!refreshToken) {
    return null;
  }
  try {
    const serviceConfig: ServiceConfig = await useServiceConfig();
    const response = await axios.post(
      `${serviceConfig.stravaUrl}/oauth/token?client_id=${serviceConfig.clientId}&client_secret=${serviceConfig.clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`
    );

    const retVal: Token = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expiry: response.data.expires_at,
      athlete: response.data.athlete,
    };
    persistToken(retVal);
    return retVal;
  } catch (error) {}
};

export const getAthlete = async (accessToken: string): Promise<Athlete> => {
  try {
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    const serviceConfig: ServiceConfig = await useServiceConfig();
    const response = axios.get(`${serviceConfig.stravaUrl}/athlete`);
    const retVal: Athlete = {} as unknown as Athlete;
    return new Promise((resolve, reject) => {
      response
        .then((data) => {
          const athlete: Athlete = {
            firstname: data.data.firstname,
            lastname: data.data.lastname,
          } as unknown as Athlete;
          resolve(athlete);
        })
        .catch((error) => {
          reject(error);
        });
    });
  } catch (error) {}
};

function persistToken(token: Token) {
  const accessToken = token.access_token;
  sessionStorage.setItem("accessToken", accessToken.toLocaleString());
  Cookies.set("token", JSON.stringify(token));
}
