import axios from "axios";

const baseURL = "/api";
const instance = axios.create({ baseURL });

export default instance;