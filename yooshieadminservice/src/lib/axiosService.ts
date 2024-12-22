import { SERVER } from '@config/environment';
import axios from 'axios';


export class AxiosService {

  async getData(params: any) {
    let { url, payload, auth } = params;
    const headersRequest = {
      'Content-Type': 'application/json',
      "accept": "application/json",
      'api_key': SERVER.API_KEY,
      'authorization': auth ? auth : "Basic eW9vc2hpZTp5b29zaGllQDEyMw==" , // NOSONAR
      'platform':1,
      'language':'en'
    };
    try{
        const resp = await axios
          .get(`${url}`, {
            headers: headersRequest,
            params: payload,
            paramsSerializer: function paramsSerializer(params) {
              return Object.entries(params)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
            }
          });
        return resp.data;
    }
    catch(e){
      if(e.response?.data){
        throw e.response.data;
      }
      else{
        throw e;
      }
    }
  }

  async postData(params: { url : string, body : Object}) {
    const { url , body } = params
    const headersRequest = {
      'Content-Type': 'application/json',
      "accept": "application/json",
      'api_key': SERVER.API_KEY,
      'authorization':'Basic eW9vc2hpZTp5b29zaGllQDEyMw==',
      'platform':1,
      'language':'en'
    };
    try{
      const resp = await axios
          .post( url, body, {
            headers: headersRequest,
      })
      return resp.data;

    }catch(e){
      throw e;
    }
  }

  async post(params: any) {
    const { url , body, auth } = params
    console.log( {url , body: JSON.stringify(body)})
    const headersRequest = {
      'Content-Type': 'application/json',
      "accept": "application/json",
      'api_key': SERVER.API_KEY,
      'authorization':auth ? auth : "Basic eW9vc2hpZTp5b29zaGllQDEyMw==", // NOSONAR
      'platform':1,
      'language':'en'
    };
    try{
      const resp = await axios
          .post( url, body, {
            headers: headersRequest,
      })
      return resp?.data;

    }catch(e){
      throw e.response?.data;
    }
  }

  async putData(params: any) {
    const { url, body, auth } = params
    console.log({ url, body: JSON.stringify(body) })
    const headersRequest = {
      'Content-Type': 'application/json',
      "accept": "application/json",
      'api_key': SERVER.API_KEY,
      'authorization':auth ? auth : "Basic eW9vc2hpZTp5b29zaGllQDEyMw==", // NOSONAR
      'platform':1,
      'language':'en'
    };
    try{
      const resp = await axios.put(
        url,
        body,
        {
          headers: headersRequest,
        }
      )
      return resp.data;
    }
    catch(error){
      throw error;
    }
  }

  async patchData(params: any) {
    const { url, body, auth } = params
    console.log({ url, body: JSON.stringify(body) })
    const headersRequest = {
      'Content-Type': 'application/json',
      "accept": "application/json",
      'api_key': SERVER.API_KEY,
      'authorization':auth ? auth : "Basic eW9vc2hpZTp5b29zaGllQDEyMw==", // NOSONAR
      'platform':1,
      'language':'en'
    };
    try{
      const resp = await axios.patch(
        url,
        body,
        {
          headers: headersRequest,
        }
      )
      return resp.data;
    }
    catch(error){
      throw error;
    }
  }

  async patch(params: any) {
    const { url, body, auth } = params
    console.log({ url, body: JSON.stringify(body) })
    const headersRequest = {
      'Content-Type': 'application/json',
      "accept": "application/json",
      'api_key': SERVER.API_KEY,
      'authorization':auth ? auth : "Basic eW9vc2hpZTp5b29zaGllQDEyMw==", // NOSONAR
      'platform':1,
      'language':'en'
    };
    try{
      const resp = await axios.patch(
        url,
        body,
        {
          headers: headersRequest,
        }
      )
      return resp.data;
    }
    catch(e){
      throw e.response.data;
    }
  }

  async deleteData(params: any) {
    let { url, payload, auth } = params;
    const headersRequest = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'api_key': SERVER.API_KEY,
      'authorization': auth ? auth : "Basic eW9vc2hpZTp5b29zaGllQDEyMw==", // NOSONAR
      'platform': 1,
      'language': 'en'
    };
  
    try {
      const resp = await axios.delete(`${url}`, {
        headers: headersRequest,
        params: payload, // Send payload as query parameters
        paramsSerializer: function paramsSerializer(params) {
          return Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&'); 
        }
      });
      return resp?.data;
    } catch (e) {
      if (e.response?.data) {
        throw e.response.data;
      } else {
        throw e;
      }
    }
  }
}


export const axiosService = new AxiosService()