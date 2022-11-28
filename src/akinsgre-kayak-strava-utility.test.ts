import {
  useServiceConfig,
  ServiceConfig,
  authenticate,
} from "./akinsgre-kayak-strava-utility";
import { Athlete, Token } from "./types/Token";

import axios from "axios";

jest.mock("axios");

describe("Service Config", () => {
  it("should return a valid service config object", async () => {
    expect.assertions(2);
    const config: ServiceConfig = {
      stravaUrl: "https://www.strava.com/api/v3",
      clientId: "58115",
      clientSecret: "",
      redirectUrl: "http://localhost:9000/",
    };
    const resp = { data: config };
    (axios.get as jest.Mock).mockResolvedValue(resp);
    const data = await useServiceConfig();
    expect(axios.get).toHaveBeenCalled();

    expect(data.clientId).toBe("58115");
  });

  it("should thrown an error because of missing stravaUrl", async () => {
    expect.assertions(1);
    const config: ServiceConfig = {
      stravaUrl: "",
      clientId: "58115",
      clientSecret: "",
      redirectUrl: "http://localhost:9000/",
    };
    const resp = { data: config };
    (axios.get as jest.Mock).mockResolvedValue(resp);
    try {
      const data = await useServiceConfig();
    } catch (e) {
      expect(e.message).toBe("Invalid Strava URL Config");
    }
  });

  describe("authenticate", () => {
    it("should authenticate", async () => {
      expect.assertions(1);
      const config: ServiceConfig = {
        stravaUrl: "",
        clientId: "58115",
        clientSecret: "",
        redirectUrl: "http://localhost:9000/",
      };
      const retVal: Token = {
        access_token: 123123,
        refresh_token: 456456,
        expiry: new Date(),
        athlete: { firstname: "Greg", lastname: "Akins" } as Athlete,
      };
      const resp = { data: config };
      (axios.get as jest.Mock).mockResolvedValue(resp);
      (axios.post as jest.Mock).mockResolvedValue({ data: retVal });
      delete window.location;
      window.location = { search: "?query=phone&code=gibberish" };

      const data = await authenticate("58115", "dummysecret");
      expect(data.firstname).toBe("Greg");
    });
  });
});
