// export function add(a: number, b: number): number {
//   return a + b;
// }

// // Learn more at https://deno.land/manual/examples/module_metadata#concepts
// if (import.meta.main) {
//   console.log("Add 2 + 3 =", add(2, 3));
// }

// // app.ts
// let message: string;

// message = 'Hi there!';

// // เนื่องจาก Deno.writeFile รับค่าเป็น Uint8Array จึงต้องแปลงค่าก่อน
// const encoder = new TextEncoder();
// const data = encoder.encode("text");

// // เป็น Promise
// Deno.writeFile('message.txt', data).then(() => {
//   console.log('Wrote to file!');
// });

// import imports map json
// import { serve } from "std/server";
import { Application, Router } from "oak";
import fs, { createReadStream, ReadStream } from "fs";
// import { BufReader } from "bufio";

const app = new Application();
const port = 8080;
const router = new Router();

// handler
router.get("/hello", (context) => {
  context.response.body = "Hello world!";
});

router.get("/audio", async (context, next) => {
  // next();
  const { request, response } = context;
  // Ensure there is a range given for the video
  const range = request.headers.get("range");
  console.log("header", request.headers);
  if (!range) {
    // ;

    context.throw(400, "Requires Range header");
  }

  // get video stats (about 61MB)
  const filePath = "audio/Ditto.mp3";
  // Get video stats (about 61MB)
  const fileSize = (await Deno.stat(filePath)).size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 4; // 1MB
  // const start = Number(range.replace(/\D/g, ""));
  // const end = Math.min(start + CHUNK_SIZE, fileSize.size - 1);
  const [start, end] = range!.replace("bytes=", "").split("-");
  const startByte = Number(start);
  const endByte = Math.min(Number(end), fileSize - 1);

  const contentLength = endByte - startByte + 1;
  const resHeaders = {
    "Content-Range": `bytes ${startByte}-${endByte}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength.toString(),
    "Content-Type": "application/octet-stream",
  };

  // HTTP Status 206 for Partial Content
  response.status = 206;
  response.headers.set("Content-Range", resHeaders["Content-Range"]);
  response.headers.set("Accept-Ranges", resHeaders["Accept-Ranges"]);
  response.headers.set("Content-Length", resHeaders["Content-Length"]);
  response.headers.set("Content-Type", resHeaders["Content-Type"]);

  // // Stream the video chunk to the client
  // fileStream.pipe(context.response);
  // Create video read stream for this particular chunk
  // const fileStream = createReadStream(filePath, {
  //   start: startByte,
  //   end: endByte,
  // });
  const startIndex = request.headers.has("range")
    ? Number(request.headers.get("range")?.replace(/\D/g, "")?.trim())
    : 0;
  const endIndex = Math.min(startIndex + videoBlockSize, videoSize);
  const video = await Deno.open(videoPath + videoName);
  if (startIndex > 0) {
    await Deno.seek(video.rid, startIndex, Deno.SeekMode.Start);
  }

  const file = await Deno.open("audio/Ditto.mp3", { read: true });
  return new Response(getStream(video), {
    status: 206,
    headers: {
      "Content-Range": `bytes ${startIndex}-${endIndex}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": `${endIndex - startIndex}`,
      "Content-Type": "video/mp4",
    },
  });
  // ReadStream(file);
  // await file.readable
  //   .pipeThrough(new TextDecoderStream())
  //   .pipeThrough(new TextEncoderStream())
  //   .pipeTo(Deno.stdout.writable);

  // Stream the video chunk to the client
  // await BufReader.create(fileStream).pipeTo(response.body);
  // response.body = fileStream;
  // new Response(fileStream)
  // const file = createReadStream(filePath, { start: startByte, end: endByte });

  // console.log("fileStream", fileStream);
  // await file.readable.pipeTo(context);
  console.log("file", file);
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(async (context) => {
  await context.send({
    root: `${Deno.cwd()}/`,
    index: "public/index.html",
  });
});

console.log("Listening at http://localhost:" + port);
await app.listen({ port });

// app.use((ctx) => {
//   ctx.response.body = "Hello World from Deno";
// });

// await app.listen({ port: 8000 });

// const server = serve({ port: 8000 });
// console.log("HTTP server listening on http://localhost:8000/");

// for await (const req of server) {
//   req.respond({ body: "Hello World\n" });
// }

// // --Start listening on port 8080 of localhost.
// const server = Deno.listen({ port: 8080 });
// console.log("File server running on http://localhost:8080/");

// for await (const conn of server) {
//   handleHttp(conn).catch(console.error);
// }

// async function handleHttp(conn: Deno.Conn) {
//   const httpConn = Deno.serveHttp(conn);
//   for await (const requestEvent of httpConn) {
//     // Use the request pathname as filepath
//     const url = new URL(requestEvent.request.url);
//     const filepath = decodeURIComponent(url.pathname);

//     // Try opening the file
//     let file;
//     try {
//       file = await Deno.open("." + filepath, { read: true });
//     } catch {
//       // If the file cannot be opened, return a "404 Not Found" response
//       const notFoundResponse = new Response("404 Not Found", { status: 404 });
//       await requestEvent.respondWith(notFoundResponse);
//       continue;
//     }

//     // Build a readable stream so the file doesn't have to be fully loaded into
//     // memory while we send it
//     const readableStream = file.readable;

//     // Build and send the response
//     const response = new Response(readableStream);
//     await requestEvent.respondWith(response);
//   }
// }
