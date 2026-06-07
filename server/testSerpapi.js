const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_lens',
        url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Danny_DeVito_by_Gage_Skidmore.jpg',
        api_key: '8b27fb7c9afbaec349a8a175451692bffe9342bc6e2faf7287eef2e7ca0871dc'
      }
    });
    console.log("Matches found:", res.data.visual_matches?.length || 0);
    if (res.data.visual_matches?.length > 0) {
      console.log(res.data.visual_matches[0]);
    } else {
      console.log("Response:", Object.keys(res.data));
    }
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}
test();
