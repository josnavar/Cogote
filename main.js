Util.events(document, {
	// Final initalization entry point: the Javascript code inside this block
	// runs at the end of start-up when the DOM is ready
	"DOMContentLoaded": function() {
        var current_song=null;
        var play_button=document.getElementById("play");
        var pause_button=document.getElementById("pause");

        var raw_media_links=[];

        async function get_raw_data(query){
            var medias=[]
            var query=await process_search(query);
            for (var index=0;index<4;index++){
                var name=query[1][index];
                medias.push(name);
            }
            return [query,medias];
        }
        async function build_media_link(query,i){
            var url1=query[0][i];
            var name=query[1][i];
            //[decoded_url,raw_signature,raw_player]
            var data= await collect_raw(url1);
            //Check if you need to unscramble
            if (data[3]!=""){
                var unscrambled_sig=data[3];
            }
            else{
                var unscrambled_sig=await unscramble(data[1],data[2]);
            }
            var media_url=data[0]+"&signature="+unscrambled_sig;
            return [media_url,name]; 
        }
        async function play(source){
            if (current_song==null){
                current_song=document.createElement("audio");
                current_song.src=source;
            }
            current_song.play();

            play_button.style.display="none";
            pause_button.style.display="inline";
            console.log(pause_button);
            //Turn play button into pause button
        }
        function pause(){
            current_song.pause();
            play_button.style.display="inline";
            pause_button.style.display="none";
        }

        function set_up_search(){
            var search_elt=document.getElementById("search_query");
            if (search_elt.value=="Search..."){
                //Clear and get ready for new search
                search_elt.value="";
            }
        }
        function update_result(i,){
            var result_i=document.getElementById("song_"+String(i)).innerText;

        }
        async function request_search(e){
            if (e.keyCode==13){
                var query=document.getElementById("search_query").value;
                for (var index=0;index<4;index++){
                    var raw_data=await get_raw_data(query);
                    var url_names=raw_data[1];
                    for (var index=0;index<4;index++){
                        var name=url_names[index];
                        console.log(name);
                        var arr=name.split("-");
                        if (arr.length>1){
                            document.getElementById("song_"+String(index+1)).innerHTML=arr[1];
                            document.getElementById("artist_"+String(index+1)).innerHTML=arr[0]
                        }
                        else{
                            document.getElementById("song_"+String(index+1)).innerHTML=arr[0];
                            document.getElementById("artist_"+String(index+1)).innerHTML="Artist not Found";
                        }
                    }
                    raw_media_links=raw_data[0];
                }
            }
        }
        async function pull_media(e){
            var song_id=e.path[0].id
            var song_id=song_id[song_id.length-1];
            
            var post_media_link=await build_media_link(raw_media_links,song_id-1);
            play(post_media_link[0]);
        }

        Util.one("[id='play']").addEventListener("click",play);
        Util.one("[id='pause']").addEventListener("click",pause);

        Util.one("[id='search_bar']").addEventListener("click",set_up_search);
        Util.one("[id='search_query']").addEventListener("keyup",request_search);
        Util.one("[id='result_container']").addEventListener("click",pull_media);
	},

	// Keyboard events arrive here
	"keydown": function(evt) {
    },
    // Click events arrive here
	"click": function(evt) {

    },
	"mousedown": function(evt) {

    },
	"mousemove": function(evt) {

    },
	"mouseup": function(evt) {

    }
});
 

