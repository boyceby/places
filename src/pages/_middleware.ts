import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { verifyTokenExtractInfo } from "../lib/utils";

export const middleware = async (req: NextRequest, ev: NextFetchEvent) => {
  const token = req?.cookies?.token;
  const verifiedToken = await verifyTokenExtractInfo(token);
  const { pathname } = req.nextUrl;
  if (
    (verifiedToken && verifiedToken.exp > Date.now() / 1000) ||
    pathname.includes("/api/sessions") ||
    pathname.includes("/static") ||
    pathname.includes("/signInBackgroundImageLight.png") ||
    pathname.includes("/signInBackgroundImageDark.png") ||
    pathname.includes("favicon.ico")
  ) {
    return NextResponse.next();
  } else if (!verifiedToken && pathname !== "/signin") {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }
};
