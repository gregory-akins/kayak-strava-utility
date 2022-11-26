export interface Token {
  access_token: number;
  refresh_token: number;
  expiry: Date;
  athlete: Athlete;
}

export interface Athlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
}
