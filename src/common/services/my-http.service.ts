import { Injectable } from '@nestjs/common';
import axios, { ResponseType } from 'axios';

interface RequestI {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  responseType?: ResponseType;
  data?: unknown;
}

interface GetMethodI {
  url: string;
  headers?: Record<string, string>;
  responseType?: ResponseType;
}

interface PostMethodI {
  url: string;
  headers?: Record<string, string>;
  responseType?: ResponseType;
  data?: unknown;
}

interface PutMethodI extends PostMethodI {}

interface HeaderOnlyI {
  url: string;
  headers?: Record<string, string>;
}

@Injectable()
export class MyHttpService {
  constructor() {}

  request<T>(params: RequestI): Promise<T> {
    return axios.request(params);
  }

  get<T>(params: GetMethodI) {
    return this.request<T>({ ...params, method: 'GET' });
  }

  post<T>(params: PostMethodI) {
    return this.request<T>({ ...params, method: 'POST' });
  }

  put<T>(params: PutMethodI) {
    return this.request<T>({ ...params, method: 'PUT' });
  }

  async head(params: HeaderOnlyI) {
    const res = await axios.head(params.url, {
      headers: params.headers,
    });
    return <Record<string, string>>res.headers;
  }
}
