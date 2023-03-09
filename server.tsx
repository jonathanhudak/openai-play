/** @jsx h */
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCompletionStream } from "https://deno.land/x/openai_chat_stream@1.0.1/mod.ts";
import "https://deno.land/std@0.178.0/dotenv/load.ts";
import { h, html } from "https://deno.land/x/htm@0.0.10/mod.tsx";
import { UnoCSS } from "https://deno.land/x/htm@0.0.10/plugins.ts";

html.use(UnoCSS());
async function readStream(stream: AsyncGenerator<string, unknown>) {
  let body = "";
  for await (const chunk of stream) {
    body += chunk;
  }
  return body;
}

async function handler(req: Request): Promise<Response> {
  console.log(req);
  let response = "";
  let query = "";
  if (
    req.method === "POST" &&
    req.headers.get("content-type") === "application/x-www-form-urlencoded"
  ) {
    const data = await req.formData();
    query = data.get("query") as string;
    const stream: AsyncGenerator<string, unknown> = getCompletionStream({
      apiKey: Deno.env.get("OPENAI_API_KEY")!,
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    });
    response = await readStream(stream);
  }

  return html({
    title: "Hello World!",
    body: (
      <div class="flex flex-col items-center justify-center w-full h-screen">
        <p class="mt-2 text-lg text-center text-gray-600 w-4xl m-auto">
          {response}
        </p>
        <footer class="fixed bottom-12 w-full flex items-center justify-center gap-2 text-gray-800">
          <form method="POST" action="/" class="p4">
            <label for="query">Question</label>
            <br />
            <textarea
              id="query"
              type="text"
              name="query"
              class="b-dashed b-1"
              value={query}
            />
            <br />
            <button type="submit" class="bg-amber p-1">
              Send
            </button>
          </form>
        </footer>
      </div>
    ),
  });
}

console.log("Listening on http://localhost:8000");
serve(handler);
