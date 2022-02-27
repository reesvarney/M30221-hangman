export default (id, data)=>{
  const template = document.getElementById(id);
  console.log(template.innerHTML);
  return template.innerHTML.replace(/\{{(.*?)\}}/g, (match)=>{
    console.log(match)
    return new String(data[match.slice(2,-2).trim()])
  });
}