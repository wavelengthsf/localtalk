<?php 
/*update prefs saves the user's interests */
	$callback = '';
if (isset($_GET['userid']))
	{ 
	//	$callback = filter_var($_GET['callback'], FILTER_SANITIZE_STRING);
		$userid = filter_var($_GET['userid'], FILTER_SANITIZE_STRING);
		$topic = filter_var($_GET['topic'], FILTER_SANITIZE_STRING);
/*	} */
//ho $userid;
//ho "<br>";
//ho $topic;

/*write user prefs to db
10.100.26.245:3306
db: localtalk
u: test
p: testing123

*/
$con=mysqli_connect("10.100.26.245","test","testing123","localtalk");

//Writes the information to the database
$insertint = "INSERT INTO `interestname` (`interestname`) VALUES ('$topic')";
//ho $insertint;

$topicid = mysqli_query($con,$insertint);

//sql_query($insertint) ;

$dynaqry = "select interestid from interestname where interestname = '".$topic."'";
//ho "<br>".$dynaqry;

//get the ID that the database just generated
$topicid = mysqli_query($con,$dynaqry);

while($row = mysqli_fetch_array($topicid))
  {
  //echo "<br> ID:".$row['interestid'];
  $topicid1= $row['interestid'];
  //ho "<br> ID:".$row['interestid'];
  //echo "<br />";
  }

$dynaqry2 = "INSERT INTO `interests` (userID,interestID) values('".$userid."','".$topicid1."')";
echo $dynaqry2;
$insert2 = mysqli_query($con,$dynaqry2);


  //mysql_query("INSERT INTO `interests` VALUES ('$userid','$topicid1')") ;

//$dynaqry2 = "select interestid from interestname where interestname = '".$topic."'";
	if (isset($_GET['callback']))
	{
		$callback = filter_var($_GET['callback'], FILTER_SANITIZE_STRING);
	}
$data = "Success";
echo $callback . '('.json_encode($data).')';

 
 mysqli_close($con);
}

//mysql_query("select interestid from interestname = '$topic'");


?>