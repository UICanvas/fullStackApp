import axios from 'axios';

const BASE_URI = 'http://localhost:4433';

const client = axios.create({
  baseURL: BASE_URI,
  json: true
});

class APIClient {
  
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  createsbData(repo) {
    return this.perform('post', '/sbRoute', repo);
  }

  deletesbData(repo) {
    return this.perform('delete', `/sbRoute/${repo.id}`);
  }

  updatesbData(repo) {
    return this.perform('put', `/sbRoute/${repo.id}`, repo);
  }

  getsbRoute() {
    return this.perform('get', '/sbRoute');
  }

  getsbData(repo) {
    return this.perform('get', `/sbData/${repo.id}`);
  }

  async perform (method, resource, data) {
    return client({
      method,
      url: resource,
      data,
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    }).then(resp => {
      return resp.data ? resp.data : [];
    })
  }
}

export default APIClient;
