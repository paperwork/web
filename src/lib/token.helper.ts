interface IJsonWebTokenPayload {
  jti: string;
  typ: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  iss: string;
}

class JsonWebTokenPayload implements IJsonWebTokenPayload {
  jti: string;
  typ: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  iss: string;
}

interface IToken {
  id: string;
  type: string;
  userId: string;
  systemId: string;
  userGid: string;
  issueTime: Date;
  expiryTime: Date;
  issuer: string;
}

class Token implements IToken {
  id: string;
  type: string;
  userId: string;
  systemId: string;
  userGid: string;
  issueTime: Date;
  expiryTime: Date;
  issuer: string;

  constructor(decodedTokenObject: JsonWebTokenPayload) {
    this.id = decodedTokenObject.jti;
    this.type = decodedTokenObject.typ;
    this.userId = decodedTokenObject.sub;
    this.systemId = decodedTokenObject.aud;
    this.userGid = this.userId + '@' + this.systemId;
    this.issueTime = new Date(decodedTokenObject.iat);
    this.expiryTime = new Date(decodedTokenObject.exp);
    this.issuer = decodedTokenObject.iss;
  }
}

export const tokenGetDecoded = (access_token?: string|null): Token|null => {
  if(typeof access_token !== 'string') {
    access_token = localStorage.getItem('access_token');
  }

  if(access_token === null) {
    return null;
  }

  const [header64, payload64, signature64] = access_token.split('.');

  if(typeof payload64 !== 'string') {
    return null;
  }

  const jwtPayload: JsonWebTokenPayload = JSON.parse(decodeURIComponent(escape(window.atob(payload64))));
  return new Token(jwtPayload);
};

export const accessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const isLoggedIn = (): boolean => {
  const aT: string | null = accessToken();
  return aT !==  null && aT.length > 0;
};
