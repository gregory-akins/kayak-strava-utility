export interface Token {
  access_token: number;
  athlete: Athlete;
}

export interface Athlete {
  id: number;
  username: string;
}
