import axios from 'axios';
import { azureDevConfig } from 'config/azure_dev';

export const getIntegrationDetails = async (params: { code: string }) => {
  try {
    const { code } = params;
    const url = 'https://app.vssps.visualstudio.com/oauth2/token';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const body = {
      client_assertion_type: azureDevConfig.client_assertion_type,
      client_assertion: azureDevConfig.client_assertion,
      grant_type: azureDevConfig.grant_type,
      assertion: code,
      redirect_uri: azureDevConfig.redirect_uri,
    };
    const response = await axios.post(url, body, {
      headers,
    });
    return response.data;
  } catch (err) {
    return [];
  }
};

export const getAzureDevMemberId = async (params: { access_token: string }) => {
  try {
    const { access_token } = params;
    const url = `${azureDevConfig.base_url}/profile/profiles/me?api-version=6.0`;
    const headers: any = {
      Authorization: `Bearer ${access_token}`,
    };

    const response = await axios.get(url, {
      headers,
    });
    return response.data;
  } catch (err) {
    return '';
  }
};

export const getAOrganization = async (params: {
  access_token: string;
  accountId: string;
}) => {
  try {
    const { access_token, accountId } = params;
    const url = `${azureDevConfig.base_url}/accounts?memberId=${accountId}&api-version=6.0`;
    const headers: any = {
      Authorization: `Bearer ${access_token}`,
    };

    const response = await axios.get(url, {
      headers,
    });
    return response.data;
  } catch (err) {
    return [];
  }
};

export const getResourceDetails = async (params: { access_token: string }) => {
  try {
    const { access_token } = params;
    const url = `https://api.atlassian.com/oauth/token/accessible-resources`;
    const headers: any = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    };

    const response = await axios.get(url, {
      headers,
    });
    return response.data;
  } catch (err) {
    return [];
  }
};
