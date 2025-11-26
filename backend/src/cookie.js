const { env } = require("./config");

const isProduction = env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction ? true : false,        // localhost → false
  sameSite: isProduction ? "none" : "lax",    // localhost → lax
  domain: isProduction ? env.COOKIE_DOMAIN : undefined,  // localhost NÃO tem domain
};

const setAccessTokenCookie = (res, accessToken) => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: env.JWT_ACCESS_TOKEN_TIME_IN_MS,
  });
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: env.JWT_REFRESH_TOKEN_TIME_IN_MS,
  });
};

const setCsrfTokenCookie = (res, csrfToken) => {
  res.cookie("csrfToken", csrfToken, {
    ...cookieOptions,
    httpOnly: false,   // CSRF token deve ser acessível no client
    maxAge: env.CSRF_TOKEN_TIME_IN_MS,
  });
};

const setAllCookies = (res, accessToken, refreshToken, csrfToken) => {
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);
  setCsrfTokenCookie(res, csrfToken);
};

const clearAllCookies = (res) => {
  const opt = {
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    domain: cookieOptions.domain,
  };

  res.clearCookie("accessToken", opt);
  res.clearCookie("refreshToken", opt);
  res.clearCookie("csrfToken", opt);
};

module.exports = {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setCsrfTokenCookie,
  setAllCookies,
  clearAllCookies,
};
