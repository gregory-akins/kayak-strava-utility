export interface Token {
  access_token: string;
  refresh_token: string;
  expiry: number;
  athlete: Athlete;
}

export interface Athlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
}
