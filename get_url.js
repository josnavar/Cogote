//Given a raw url, fetch html, fetch relevant stream urls for processing
//preference for opus,
var p1="\\<script\\s\\>var\\sytplayer(.+)\\<\\/script\\>"
var total_length=0;
function grab_func1(index,source,start,target){
    var whole_func=``;
    var curr_window=source.slice(index,index+target.length);
    var curr_prefix=source.slice(index-start.length,index);
    var curr_letter=source[index];

    var begun=false;
    while (curr_window!=target || !begun){
        if (index>total_length){
            break;
        }
        if (begun){
            if (curr_letter=='"'){
                whole_func+="'";
            }
            else{
                whole_func+=curr_letter;
            }
        }
        else{
            if (curr_prefix==start){
                begun=true
                if (curr_letter=='"'){
                    whole_func+="'";
                }
                else{
                    whole_func+=curr_letter;
                }
            }
        }
        index+=1;
        curr_letter=source[index];
        curr_window=source.slice(index,index+target.length);
        curr_prefix=source.slice(index-start.length,index);
    }
    return [whole_func,index];
}
//Find quality of interest and then scan until url is found, decode url extract signature and then decipher it
var audio1="type=audio"
var sig_tag="^s=(.+)"
var clean_s_tag="^sig=(.+)"
var player_head="https://s.ytimg.com"
var player_tag="/yts/jsbin/player";
var url_tag="^url=(.+)"


function preHTML(item){
    var player_string=item;
    item=String(JSON.parse(item));
    var reg1=new RegExp(p1);
    var reg2=new RegExp(audio1);
    var reg3=new RegExp(player_tag);

    var result=reg1.exec(item)[1];

    //Need to split based on commas 
    var comma_arr=result.split(",");
    comma_arr.forEach(function(elt){
        var index=elt.search(reg2);
        if (index!=-1){
            result=elt;
        }
    });
    total_length=item.length;
    //Get js player location
    var player_index=item.search(reg3);
    var raw_player=player_head+player_tag+grab_func1(player_index,player_string,player_tag,'"')[0]
    raw_player=raw_player.split(".js")[0]+".js";


    var url_reg=new RegExp(url_tag);
    var sig_reg=new RegExp(sig_tag);
    var clean_reg=new RegExp(clean_s_tag);
    //Loop through elements and find URL and signature tag
    var raw_url=``;
    var raw_sig=``;
    var raw_clean=``;
    var u_split=result.split("\\u0026");
    u_split.forEach(function(elt){
        var url_obj=url_reg.exec(elt);
        var sig_obj=sig_reg.exec(elt);
        var clean_obj=clean_reg.exec(elt);

        if (url_obj!=null){
            raw_url=decodeURIComponent(url_obj[1]);
        }
        if (sig_obj!=null){
            raw_sig=sig_obj[1];
        }
        if (clean_obj!=null){
            raw_clean=clean_obj[1];
        }
    });
    //Check if there is a quotation sign
    return [raw_url,raw_sig,raw_player,raw_clean];
}

var base_url="https://empty-yak-64.localtunnel.me/query?url=";
//CORS BLOCKS HTML CONNECTIONS, connect to server and expect raw html to post 
function get_html(url,callback){
    return new Promise(function (resolve,reject){
        var req = new XMLHttpRequest();
        req.open("GET",url,true);
        req.onreadystatechange = function(){
            if (req.readyState==4 && req.status==200){
                resolve(callback(req.responseText));
            }
        }
        req.send(null);
    });
}
function stuff(elt){
    return elt;
}
async function collect_raw(url){
    var full_url=base_url+url;
    var data=await get_html(full_url,preHTML).then(stuff);
    return data; 
}