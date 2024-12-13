addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
  })
  
  const api_token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJib3NzX2lkIjoiMjQxNTY0NDM2IiwiZGV2aWNlX3Rva2VuIjoic3k2dnl5dnFqVGlFNUdlcUg3RloycVZSIiwiZGV2aWNlX2lkIjoiTVRVeU9XUTVORFF0TmpNeU5pMDBaVEE1TFdKaU9UWXRPRGRqTVdSbFpqWmlNamc1IiwiZGV2aWNlX3R5cGUiOiJ3ZWIiLCJkZXZpY2Vfb3MiOiJicm93c2VyIiwiZHJtX2lkIjoiTVRVeU9XUTVORFF0TmpNeU5pMDBaVEE1TFdKaU9UWXRPRGRqTVdSbFpqWmlNamc1IiwiZXh0cmEiOnsicHJvZmlsZV9pZCI6NH0sImlhdCI6MTczMzQxMDY1MSwiZXhwIjoxNzMzNDE0MjUxfQ.ebCZoikqCkLYkIvaVKwLDKBZv7iqLYslMaKgvLlTAXsVZOlT_gM8SwedMEvMDLyfA9eV4TRJQJwDtBHMDYyKzKE47F6gQ1dSRg4BJi8E42yOwzUFUluv_hUTTjtA0zxSVzpsyKTS9NgQnovFFsdOKYU12LUrsk4XLhDOOVdq0l4szVMVms4Y7wwmC8QXcDXBsXqgGEWLsuK0NyjNzUxwELyieJS4_RvNCWaxkHB8Jbbh_9-q2DU5saJTy7uZtMvBRtAQg8TpjpB7DyTdaZdE8TaI3c1VHn8Ujzq-nplL4MoUn_RvdEpjMzqOyEf0RVsVBBPIfET6D7Hr3hubnrWBY_h6OLelVXoe2ovNoIoVDTRe3-PwWVvBBBI4HAajQWtxSxvzWd-bcKKy_ujKDoutfEDx6yFvOddTVAMbJD70qSl5-wIi0ACcHpW07z1xUCQVuz35UxpzTGFAzo7zkuRT7R4cZjt9GqmPnjtKhtdL5Hu010ievS28EwaNgC1Ubb2Jd6EEmK-xSM_YCYtkGdTfIrfGTgICDJAbkLCS4vgr9k-84rZM9fJJhj5bUmZnFpJ4kpmVRhUzQSvGTcmuihKJ8uWG03QnhSH_ZYQ7sB8RIH0LJ95A21_ON1ihc-ADoH6lbRrRuVuDZx3onC0QQEUQDZlpTRnBMqpzqubl47Ta1ko';
  async function get_mytvsuper(channel) {
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${api_token}`,
      'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
      'Host': 'user-api.mytvsuper.com',
      'Origin': 'https://www.mytvsuper.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5.2 Safari/605.1.15',
      'Referer': 'https://www.mytvsuper.com/',
      'X-Forwarded-For': '116.49.236.216', 
    }
  
    const params = new URLSearchParams();
    params.append('platform', 'android_tv');
    params.append('network_code', channel);
  
    const response = await fetch(`https://user-api.mytvsuper.com/v1/channel/checkout?${params}`, { headers });
    if (response.status != 200) {
      return null;
    }
  
    const json = await response.json();
    const profiles = json.profiles || [];
    let play_url = '';
    for (let i of profiles) {
      if (i.quality === 'high') {
        play_url = i.streaming_path;
        break;
      }
    }
  
    if (!play_url) {
      return null;
    }
    return play_url.split('&p=')[0];
  }
  
  async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname.split('/');
    const id = path.pop();
  
    const redirect_url = await get_mytvsuper(id) || 'https://nolive.livednow.com/nolive.m3u8';
  
    let cacheControl = 'public, max-age=10'
    if (redirect_url !== 'https://nolive.livednow.com/nolive.m3u8') {
      cacheControl = 'public, max-age=43200' 
    }
  
    const response = new Response(null, {
      status: 302,
      headers: {
        Location: redirect_url,
        'Cache-Control': cacheControl,
      },
    });
    return response;
  }