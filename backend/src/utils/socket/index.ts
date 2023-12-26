export const tokenParse = (inputString: string) => {
  // Use regular expression to find the access token
  const match = inputString.match(/access_token=([^;]+)/);
  let accessToken;
  if (match) {
    accessToken = match[1];
    return accessToken;
  } else {
    return null;
  }
};
