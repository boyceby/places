import cookie from "cookie";
import { NextApiResponse } from "next";
import { SessionsRespData, TOKEN_MAX_AGE } from "../pages/api/sessions";

export const setTokenCookie = (
  token: string,
  res: NextApiResponse<SessionsRespData>
) => {
  const cookieToSet = cookie.serialize("token", token, {
    maxAge: TOKEN_MAX_AGE,
    expires: new Date(Date.now() + TOKEN_MAX_AGE * 1000),
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.setHeader("set-cookie", cookieToSet);
};

export const removeTokenCookie = (res: NextApiResponse<SessionsRespData>) => {
  const blankTokenCookie = cookie.serialize("token", "", {
    maxAge: -1,
    path: "/",
  });
  res.setHeader("set-cookie", blankTokenCookie);
};
