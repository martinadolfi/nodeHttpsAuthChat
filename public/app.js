/**
 * Created by MartinG on 26/08/2014.
 */
var xhr = new XMLHttpRequest();
var donde = 0;
xhr.onprogress = function(){
    $( "#chat"  ).append(this.responseText.substr(donde));
    donde = this.responseText.length;

};

xhr.open("POST","/data");
xhr.setRequestHeader("Content-type","application/octet-stream");

xhr.onreadystatechange = function(){

    $( "#chat"  ).append(this.responseText.substr(donde));
    donde = this.responseText.length;

};

$( document ).ready(function(){
    $("#sendBtn").click(function(){
        if (xhr.readyState!=1){
            xhr.abort();
            xhr.open("POST","/data");
            xhr.setRequestHeader("Content-type","application/octet-stream");
        }
        xhr.send($("#myText").val());
        $("#myText").val("");
    });

    $('#myText').keypress(function(e){
        if(e.keyCode==13){
            $('#sendBtn').click();
        }
    });

});

