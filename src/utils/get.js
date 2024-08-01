import randomUserAgent from "./header.js";
import axios from "axios";

const get = async (url) => {
    try {
        const options = {
            headers: { 'User-Agent': randomUserAgent() }
            // TODO: Add proxy 
        };
        const rep = await axios.get(url, options);
        return rep;
    } catch (err) {
        throw new Error(`Error fetching URL ${url}: ${err.message}`);
    }
};

export default get;
