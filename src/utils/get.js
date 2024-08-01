import randomUserAgent from "./header.js";
import axios from "axios";

const get = async (url) => {
    try {
        const rep = await axios.get(url, { headers: { 'User-Agent': randomUserAgent() } });
        return rep
    } catch (err) {
        throw new Error(`Error fetching URL ${url}: ${err.message}`);
    }
};

export default get;