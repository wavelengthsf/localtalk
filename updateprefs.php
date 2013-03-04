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
ec2-50-112-223-94.us-west-2.compute.amazonaws.com:3306
db: localtalk
u: test
p: testing123

*/
$con=mysqli_connect("ec2-50-112-223-94.us-west-2.compute.amazonaws.com","root","test12","localtalk");

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
//echo $dynaqry2;
$insert2 = mysqli_query($con,$dynaqry2);


  //mysql_query("INSERT INTO `interests` VALUES ('$userid','$topicid1')") ;

//$dynaqry2 = "select interestid from interestname where interestname = '".$topic."'";
	if (isset($_GET['callback']))
	{
		$callback = filter_var($_GET['callback'], FILTER_SANITIZE_STRING);
	}
/*
	$dynaqry3 = "select distinct(interestname) FROM interests, interestname WHERE interests.interestID = interestname.interestID and userID = '$userid'";
//echo $dynaqry3;
$insert3 = mysqli_query($con,$dynaqry3);

while($row = mysqli_fetch_array($insert3))
  {
  //echo "<br> ID:".$row['interestid'];
  $interestlist[] = $row['interestname'];
  //ho "<br> ID:".$row['interestid'];
  //echo "<br />";
  }
$data = "Success";
//echo $callback . '('.json_encode($data).')';
	
	//echo $callback . '('.json_encode($data).')';
echo json_encode($interestlist); */

 
 mysqli_close($con);

 $mysql_user = 'root';
	$mysql_password = 'test12';
	$database = 'localtalk';

	$callback = '';
	
	if (isset($_GET['callback']))
	{
		$callback = filter_var($_GET['callback'], FILTER_SANITIZE_STRING);
	}

	if (isset($_GET['userid']))
	{
		$userid = $_GET['userid'];
	}

	$link = mysql_connect('ec2-50-112-223-94.us-west-2.compute.amazonaws.com', $mysql_user, $mysql_password);
	
	if (!$link) {
   	 	die('Could not connect: ' . mysql_error());
	}

	$db_selected = mysql_select_db($database, $link);
	
	if (!$db_selected) {
    	die ('Can\'t use foo : ' . mysql_error());
	}

	$result = mysql_query("select interestname FROM interests, interestname WHERE interests.interestID = interestname.interestID and userID = '$userid'");
	
	if (!$result) {
    	die('Invalid query: ' . mysql_error());
	}

	while($r = mysql_fetch_assoc($result)) {
		 $data[] = $r;
   	}
//echo $dynaqry2;

	mysql_close($link);

	//echo $callback . '('.json_encode($data).')';
echo json_encode($data);
 }

//mysql_query("select interestid from interestname = '$topic'");


?>