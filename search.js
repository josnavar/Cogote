//Given a query search for video url

var server_base="https://dull-crab-62.localtunnel.me/search?tag=";
function stuff(data){
    return data;
}
function send_query(url){
    return new Promise(function (resolve,reject){
        var req = new XMLHttpRequest();
        req.open("GET",url,true);
    
        req.onreadystatechange = function(){
            if (req.readyState==4 && req.status==200){
                resolve(req.responseText);
            }
        }
        req.send(null);
    });
}
async function process_search(query){
    query=query.replace(/\s/g,"_")
    var url=server_base+query;
    var links_names= await send_query(url).then(stuff);
    return JSON.parse(links_names);
}
