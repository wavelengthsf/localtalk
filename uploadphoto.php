<?php   

// filename: upload.processor.php 

// first let's set some variables 

// make a note of the current working directory, relative to root. 
$directory_self = str_replace(basename($_SERVER['PHP_SELF']), '', $_SERVER['PHP_SELF']); 

// make a note of the directory that will recieve the uploaded file 
$uploadsDirectory = $_SERVER['DOCUMENT_ROOT'] . $directory_self . 'images2/'; 

// make a note of the location of the upload form in case we need it 
$uploadForm = 'http://' . $_SERVER['HTTP_HOST'] . $directory_self . 'upload.form.php'; 

// fieldname used within the file <input> of the HTML form 
$fieldname = 'file'; 
$image=basename($_FILES['file']['name']);

if ($_FILES["file"]["error"] > 0){
    echo "Error Code: " . $_FILES["file"]["error"] . "<br />";
}
else
{
    $path = "images2/". date('Ymdgisu');

    $path = $path.basename($_FILES['file']['name']);

    if(move_uploaded_file($_FILES['file']['tmp_name'], $path)) {


     } else{

 	echo "[{\"result\":\"failed"\}]";

    }
}
 $UID = $_POST['userID'];    
// If you got this far, everything has worked and the file has been successfully saved. 
// We are now going to redirect the client to a success page. 
mysql_connect("ec2-50-112-223-94.us-west-2.compute.amazonaws.com", "root", "test12") or die(mysql_error()) ;
mysql_select_db("localtalk") or die(mysql_error()) ;
$newname = "http://ec2-50-112-223-94.us-west-2.compute.amazonaws.com/localtalk".$path;
//Writes the information to the database
mysql_query("INSERT INTO pics (pic,userid) VALUES ('$newname','$UID')") ;
 	echo "[{\"path\":\"".$newname."\"}]";

// The following function is an error handler which is used  
// to output an HTML error page if the file upload fails 

 // end error handler 

?>