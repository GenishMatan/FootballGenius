/**
 * Created by ElyGenish on 4/21/15.
 */
var url = 'http://localhost:8080/'
    //replace url
//var url = 'ec2-52-5-171-196.compute-1.amazonaws.com'

function httpGet(servlet)
{
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url.concat(servlet), false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function httpPost(servlet ,body)
{
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", url.concat(servlet), false );
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(body);
    return xmlHttp.responseText;
}