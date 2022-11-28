import {
  useServiceConfig,
  ServiceConfig,
} from "./akinsgre-kayak-strava-utility";
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
});
