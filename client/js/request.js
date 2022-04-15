import error from './error.js';

async function request(address, opts = {}) {
  const res = await fetch(address, opts);
  const text = await res.text();
  try {
    if ('error' in JSON.parse(text)) {
      error.create(JSON.parse(text).error);
    }
  } catch {
    // No error
  }
  return text;
}

export default {
  POST: (addr, data) => {
    return request(addr, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  },
  GET: request,
};
