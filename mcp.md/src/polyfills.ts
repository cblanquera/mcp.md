//node
import { webcrypto } from 'node:crypto';
import { ReadableStream } from 'node:stream/web';
//modules
import { fetch, Headers, Request, Response, FormData } from 'undici';

const g: any = globalThis;

if (!g.fetch) g.fetch = fetch;
if (!g.Headers) g.Headers = Headers;
if (!g.Request) g.Request = Request;
if (!g.Response) g.Response = Response;
if (!g.FormData) g.FormData = FormData;
if (!g.crypto) g.crypto = webcrypto;
if (!g.ReadableStream) g.ReadableStream = ReadableStream;
