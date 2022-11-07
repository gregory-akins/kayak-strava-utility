import { useServiceConfig } from "./akinsgre-kayak-strava-utility";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Service Config", () => {
  it("should just not fail", () => {
    expect(true).toBeTruthy();
  });
});
