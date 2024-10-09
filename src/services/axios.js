import axios from 'axios';
import Config from 'react-native-config';

const baseUrl = Config.BASE_URL;

const apiKey = Config.API_KEY;

const getHeaders = (token) => {
  if (token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  } else {
    return {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    };
  }
};

export const get = (url,token) => {
  let newUrl = baseUrl + url;
  return axios
    .get(newUrl,{
      headers: getHeaders(token)
    }

    )
    .then((res) => {
      if (res.status == 200) {
        return res.data;
      } else {
        return [];
      }
    })
    .catch((error) => {
      throw error
    });
};


export const post = (url, params,token=null) => {
  return axios
    .post(baseUrl + url, params, {
      headers: getHeaders(token)
    })
    .then((res) => {
      if (res.status == 200 || res.status== 201) {
        return res.data;
      } else {
        return [];
      }
    })
    .catch((resp) => {
      let errorMsg = 'An error occurred while making the request.';
      const serverErrorMessage=resp.response?.data?.message
      if (serverErrorMessage) {
        const firebaseErrorMatch = serverErrorMessage.match(/Firebase: (.*)\.$/);
        if (firebaseErrorMatch && firebaseErrorMatch[1]) {
          errorMsg = firebaseErrorMatch[1];
        } else {
          errorMsg = serverErrorMessage;
        }
      }
      throw errorMsg
    });
};

export const put = (url, params,token=null) => {
  return axios
    .put(baseUrl + url, params,{
      headers: getHeaders(token)
    })
    .then((res) => {
      if (res.status == 200) {
        return res.data;
      } else {
        return res.data;
      }
    })
    .catch((error) => {
      throw error.response?.message
    });
};
export const del = (url, params,token) => {
  return axios
    .delete(baseUrl + url,{
      headers: getHeaders(token),
      data: params
    })
    .then((res) => {
      if (res.status == 200) {
        return res.data;
      } else {
        return res.data;
      }
    })
    .catch((error) => {
      throw error.response?.message
    });
};