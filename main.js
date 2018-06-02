var playlist_list=null;
var dummy_tile=document.getElementById("music_entry_0");
var mock_tile=dummy_tile.cloneNode(true);
var music_list=document.getElementById("music_list");
music_list.removeChild(dummy_tile);


function add_song_tiles(song,artist,i,event_response){
    var curr_tile=mock_tile.cloneNode(true);

    curr_tile.id="music_entry_"+String(i);
    
    var artist_node=curr_tile.childNodes[1];
    var song_node=curr_tile.childNodes[3];
    var del_node=curr_tile.childNodes[5];
    var add_node=curr_tile.childNodes[7];

    artist_node.id="artista_"+String(i);
    artist_node.innerHTML=song;
    song_node.id="cancion_"+String(i);
    song_node.innerHTML=artist;
    del_node.id="del_"+String(i);
    add_node.id="add_"+String(i);

    //Update grid location
    curr_tile.style.gridRow=i;
    //Add new listeners
    curr_tile.addEventListener("mousedown",event_response);
    music_list.appendChild(curr_tile);
}
function load_from_local(event_response){
    //Populate list of songs into playlist form localstorage
    playlist_list=localStorage.getItem("playlists");
    if (playlist_list!=null){
        playlist_list=JSON.parse(playlist_list);

        //Song is a stack of songs based on added time
        song_list=playlist_list["All songs"];
        var counter=0;
        for (var entry in song_list){
            counter+=1;
            var song=song_list[entry][0];
            var artist=song_list[entry][1];
            var url=song_list[entry][2];

            add_song_tiles(song,artist,counter,event_response);


        document.documentElement.style.setProperty("--num_songs",song_list.length);

        }
        
    }
    else{
        //Create a new entry.
        var all_songs=[]
        var dict_of_playlists={};
        dict_of_playlists["All songs"]=all_songs
        playlist_list=dict_of_playlists;
        localStorage.setItem("playlists",JSON.stringify(dict_of_playlists));
    }
}
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
            console.log(unscrambled_sig);
            var media_url=data[0]+"&signature="+unscrambled_sig;
            return [media_url,name]; 
        }
        async function play(source,check){
            if (current_song==null){
                current_song=document.createElement("audio");
                current_song.src=source;
            }
            if (check){
                current_song.src=source;
            }
            current_song.play();

            play_button.style.display="none";
            pause_button.style.display="inline";
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
        async function request_search(e){
            if (e.keyCode==13){
                var query=document.getElementById("search_query").value;

                var raw_data=await get_raw_data(query);
                var url_names=raw_data[1];
                for (var index=0;index<4;index++){
                    var name=url_names[index];
                    var arr=name.split("-");
                    if (arr.length>1){
                        document.getElementById("song_"+String(index+1)).innerHTML=arr[1];
                        document.getElementById("artist_"+String(index+1)).innerHTML=arr[0]
                    }
                    else{
                        document.getElementById("song_"+String(index+1)).innerHTML=arr[0];
                        document.getElementById("artist_"+String(index+1)).innerHTML="Artist not Found";
                    }
                raw_media_links=raw_data[0];
                document.getElementById("result_container").style.display="grid";
                }
            }
        }
        async function pull_media(e){
            var song_id=e.path[0].id
            var song_id=song_id[song_id.length-1];
            
            var post_media_link=await build_media_link(raw_media_links,song_id-1);
            document.getElementById("result_container").style.display="none";
            play(post_media_link[0],true);

            
            //Update now playing containers
            document.getElementById("curr_song").innerHTML=document.getElementById("song_"+String(song_id)).innerHTML;
            document.getElementById("curr_artist").innerHTML=document.getElementById("artist_"+String(song_id)).innerHTML;
        }
        function play_tile(e){
            console.log(e);
            var song_id=e.path[0].id.split("_")[1];
            var curr_playlist=document.getElementById("playlist_select").value;
            var list_of_songs=playlist_list[curr_playlist];

            var song_pack=list_of_songs[song_id-1];
            var song_name=song_pack[0];
            var artist_name=song_pack[1];
            var song_url=song_pack[2];

            play(song_url,true);
        }
        function add_to_playlist(){
            //Check current selected playlist in selector and add current song into entry.
            var curr_playlist=document.getElementById("playlist_select").value;
            var list_of_songs=playlist_list[curr_playlist];

            var song_playing=document.getElementById("curr_song").innerHTML;
            var artist_playing=document.getElementById("curr_artist").innerHTML;
            var url_playing=current_song.src;

            //Add to local to storage
            var to_storage=[song_playing,artist_playing,url_playing];
            list_of_songs.push(to_storage);
            playlist_list[curr_playlist]=list_of_songs;
            localStorage.setItem("playlists",JSON.stringify(playlist_list));

            document.documentElement.style.setProperty("--num_songs",list_of_songs.length);
            add_song_tiles(song_playing,artist_playing,list_of_songs.length,play_tile);
        }

        load_from_local(play_tile);

        Util.one("[id='play']").addEventListener("mousedown",play);
        Util.one("[id='pause']").addEventListener("mousedown",pause);

        Util.one("[id='search_bar']").addEventListener("mousedown",set_up_search);
        Util.one("[id='search_query']").addEventListener("keyup",request_search);
        Util.one("[id='result_container']").addEventListener("mousedown",pull_media);

        //Adding new songs to a playlist 
        Util.one("[id='add']").addEventListener("mousedown",add_to_playlist);

        Util.one(".music_entry").addEventListener("mousedown",play_tile);

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
 

