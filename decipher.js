var js_player=null;
var js_player_url=null;

function grab_func(index,source,target){
    var whole_func=``;
    var curr_window=source.slice(index,index+target.length);
    var curr_letter=source[index];
    while (curr_window!=target){
        if (curr_letter=='"'){
            whole_func+="'";
        }
        else{
            whole_func+=curr_letter;
        }
        index+=1;
        curr_letter=source[index];
        curr_window=source.slice(index,index+target.length);
    }
    return whole_func+target;
}
function get_stuff(de){
    var ln='[a-zA-Z]+[0-9a-zA-Z]*'
    var p3='\\|\\|"signature",('+ln+')\\(';
    var p4='"signature"\\:"sig",'+ln+'\\=('+ln+')\\(';
    //To get the functions that the main function depends, access their lines
    var recursive_ops='('+ln+'\\.'+ln+')'+'\\((\\w+\\,?)+\\)\\;?';

    var reg1=new RegExp(p3);
    var reg2=new RegExp(p4);
    var reg3=new RegExp(recursive_ops,"g");

    var func_name=reg1.exec(de)[1];
    var p3=func_name+'\\=function\\(';
    var index=de.search(p3);

    var whole_func=grab_func(index,de,"}");
    whole_func=whole_func.split("{")[1];
    whole_func="{"+whole_func;
    var groups=new Set([]);
    var all_fns=``;
    var match=reg3.exec(whole_func);
    var arr=match[1].split(".");
    if (arr.length>1){
        groups.add(arr[0])
    }
    else{
        groups.add(match[1]);
    }

    var counter=0;
    while (match!=null){
        var arr=match[1].split(".");
        if (arr.length>1){
            groups.add(arr[0])
        }
        else{
            groups.add(match[1]);
        }
        match=reg3.exec(whole_func);
        counter++;
        if (counter>100){
            break;
        }
    }
    groups.forEach(function(item){
        var p='var\\s'+item+'\\=\\{';
        var index=de.search(p);
        var func=grab_func(index,de,"}};");
        all_fns+=func;
    });
    all_fns+=whole_func;
    return all_fns;    
}

var js_url="http://18.220.236.36:8000/js_query?url=";
// function get_js_player(url,callback,signature){
//     return new Promise(function (resolve,reject){
//         if (js_player==null){
//             var req = new XMLHttpRequest();
//             req.open("GET",url,true);
//             req.onreadystatechange = function(){
//                 if (req.readyState==4 && req.status==200){
//                     js_player=req.responseText;
//                     var all_fns=callback(req.responseText);
//                     var eqn=new Function("a",all_fns);
//                     resolve((eqn(signature)));
//                 }
//             }
//             req.send(null);
//         }
//         else{
//             console.log("its cached");
//             //Player is cached, access it
//             var all_fns=callback(js_player);
//             var eqn=new Function("a",all_fns);
//             resolve((eqn(signature)));
//         }
//     });
// }
function get_js_player(url){
    return new Promise(function (resolve,reject){
        if (js_player==null){
            var req = new XMLHttpRequest();
            req.open("GET",url,true);
            req.onreadystatechange = function(){
                if (req.readyState==4 && req.status==200){
                    post_sig=req.responseText;
                    resolve(post_sig);
                }
            }
            req.send(null);
        }
    });
}
function get_clean(stuff){
    return stuff
}
async function unscramble(raw_signature,player){
    var full_url=js_url+player+"&sig="+raw_signature;
    //var clean= await get_js_player(full_url,get_stuff,raw_signature).then(get_clean);
    var clean= await get_js_player(full_url).then(get_clean);
    return clean 
}