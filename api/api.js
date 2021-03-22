import axios from "axios";

const baseURL = `https://padont.com/api`;
const instance = axios.create({ baseURL });

export default instance;