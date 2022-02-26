async function request(address, err=()=>{}){
  const res = await fetch(address);
  const text = await res.text();
  console.log("REQUEST SENT", address);
  return text
}

export default request;