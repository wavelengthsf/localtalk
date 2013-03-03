<?php 
/*update prefs saves the user's interests */
	$callback = '';
/*	if (isset($_GET['callback']))
	{ */
	//	$callback = filter_var($_GET['callback'], FILTER_SANITIZE_STRING);
		$userid = filter_var($_GET['userid'], FILTER_SANITIZE_STRING);
		$topic = filter_var($_GET['topic'], FILTER_SANITIZE_STRING);
/*	} */
echo $userid;
	echo "<br>";
	echo $topic;

/*write user prefs to db
10.100.26.245:3306
db: localtalk
u: test
p: testing123

*/
$con=mysqli_connect("10.100.26.245","test","testing123","localtalk");

//Writes the information to the database
mysql_query("INSERT INTO `interestname` (`interestname`) VALUES ('$topic')") ;

$dynaqry = "select interestid from interestname where interestname = '".$topic."'";
echo "<br>".$dynaqry;

//get the ID that the database just generated
$topicid = mysqli_query($con,$dynaqry);

while($row = mysqli_fetch_array($topicid))
  {
  echo "<br> ID:".$row['interestid'];
  $topicid1=$row['interestid'];
  echo "<br />";
  }
 mysql_query("INSERT INTO `interestname` (`interestname`) VALUES ('$userid','$topicid1')") ;

$dynaqry2 = "select interestid from interestname where interestname = '".$topic."'";

 
 mysqli_close($con);


//mysql_query("select interestid from interestname = '$topic'");

?>