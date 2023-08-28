import axios from "axios";
import { dataparams } from "../data/dataParams";

const api = BASEURL;
axios.defaults.baseURL = api;

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

dataparams.subscribe((value) => localStorage.isrefresh = 1);