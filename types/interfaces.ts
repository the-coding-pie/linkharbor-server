export interface UserTokenObj {
  id: number;
}

export interface CategoryObj {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayloadObj {
  iss: string;
  azp: string;
  aud: "1049334560656-ulmsvj7iugr0rqcd5dqqqrn2bu22p4c9.apps.googleusercontent.com";
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: number;
  exp: number;
}
