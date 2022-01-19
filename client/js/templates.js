export default (id, data)=>{
  const template = document.getElementById(id);
  return template.innerHTML.replace(/\{{(.*?)\}}/g, (match)=>{
    return new String(data[match.slice(2,-2).trim()])
  });
}