import { Athlete, Token } from "./types/Token";
import _ from "lodash";
import Cookies from "js-cookie";
import axios from "axios";

export interface ServiceConfig {
  stravaUrl: string;
  kayakStravaUrl: string;
  clientId: string;
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

export const authenticate = async (): Promise<Athlete> => {
  try {
    // Save the Auth Token to the Store (it's located under 'search' for some reason)

    if (!location.search || location.search.split("&").length < 2) {
      return undefined;
    } else {
      const stravaAuthToken: string = cleanUpAuthToken(location.search);
      //Post Request to Strava (with AuthToken) which returns Refresh Token and and Access Token

      const token: Token = await getStravaAuth(stravaAuthToken);
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

const getStravaAuth = async (authTok: string): Promise<Token> => {
  try {
    const serviceConfig: ServiceConfig = await useServiceConfig();
    const { data } = await axios.post(
      `${serviceConfig.kayakStravaUrl}/getauth?code=${authTok}`,
      {}
    );
    const retVal: Token = {
      access_token: data.body.access_token,
      refresh_token: data.body.refresh_token,
      expiry: data.body.expires_at,
      athlete: data.body.athlete,
    };

    return retVal;
  } catch (error) {}
};

export const refreshStravaAuth = async (): Promise<Token> => {
  const token: Token = JSON.parse(Cookies.get<Token>("token"));
  const refreshToken: string = token.refresh_token;

  const authTok: string = token.access_token;

  if (!refreshToken && token.expiry < Math.floor(Date.now() / 1000)) {
    return null;
  }
  try {
    const serviceConfig: ServiceConfig = await useServiceConfig();
    const refreshUrl: string = `${serviceConfig.kayakStravaUrl}/refreshauth?refreshToken=${refreshToken}&code=${authTok}`;

    const { data } = await axios.post(refreshUrl, {});

    const retVal: Token = {
      access_token: data.body.access_token,
      refresh_token: data.body.refresh_token,
      expiry: data.body.expires_at,
      athlete: data.body.athlete,
    };
    if (retVal) persistToken(retVal);
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
