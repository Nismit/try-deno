import { serve } from "https://deno.land/std@0.141.0/http/server.ts";
import { decode } from "https://deno.land/std@0.141.0/encoding/base64.ts";

const port = 8080;

const headers = new Headers();
headers.append('Content-type', 'application/json');
headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');
headers.append("Access-Control-Allow-Methods", 'POST, GET, OPTIONS');
headers.append('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');

const handler = async (request: Request): Promise<Response> => {

  if (request.method === 'GET') {
    const body = `Your user-agent is:\n\n${
      request.headers.get("user-agent") ?? "Unknown"
    }`;
  
    return new Response(body, { status: 200 });
  } 

  if (request.method === 'POST') {
    try {
      const payload = await request.text();
      const data: {[key: string]: string} = JSON.parse(payload);

      for (const [key, value] of Object.entries(data)) {
        const base64Data = value.replace(/^data:image\/png;base64,/, "");
        Deno.writeFileSync(`./output/${key}.png`, decode(base64Data));
      }

      console.log('Request data', data);

      return new Response('success', {
        headers: headers,
        status: 200,
        statusText: 'Succeeded To Save Images'
      });
    } catch (err: Error | unknown) {
      console.log('Err:', err);
      return new Response('Error', {
        headers: headers,
        status: 500,
        statusText: 'Failed To Save Images'
      });
    }
  }

  if (request.method === 'OPTIONS') {
    return new Response('success', { headers: headers, status: 200, });
  }

  console.log('Req', request);

  return new Response('Not found', { status: 404 });
};

console.log(`Listening on http://localhost:${port}/`);
await serve(handler, { port });