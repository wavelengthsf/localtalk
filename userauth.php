<?php 
/*update prefs saves the user's interests */
	$callback = '';
if (isset($_GET['email']))
	{ 
	//	$callback = filter_var($_GET['callback'], FILTER_SANITIZE_STRING);
		$emailaddy = filter_var($_GET['email'], FILTER_SANITIZE_STRING);
/*	} */
//ho $userid;
//ho "<br>";
//ho $topic;

/*write user prefs to db
ec2-50-112-223-94.us-west-2.compute.amazonaws.com:3306
db: localtalk
u: test
p: test12

*/
$con=mysqli_connect("ec2-50-112-223-94.us-west-2.compute.amazonaws.com","root","test12","localtalk");


$insertint = "select ID from User where email ='".$emailaddy."'";
//echo $insertint;
$userIdent = mysqli_query($con,$insertint);

//Writes the information to the database
//ho $insertint;


//sql_query($insertint) ;

//$dynaqry = "select interestid from interestname where interestname = '".$topic."'";
//ho "<br>".$dynaqry;

//get the ID that the database just generated
//$topicid = mysqli_query($con,$dynaqry);

while($row = mysqli_fetch_array($userIdent))
  {
  //echo "<br> ID:".$row['interestid'];
  $UID= $row['ID'];
  }

if ($UID==0)
  {
  $dynaqry3 = "INSERT INTO `log` (log) values('User auth:".$emailaddy." and returned FAILED')";
//echo $dynaqry2;
$insert3 = mysqli_query($con,$dynaqry3);

		    	die('"{\"result\":\"failure\"}"');
		
  }
$dynaqry2 = "INSERT INTO `log` (log) values('User auth:".$emailaddy." and returned ".$UID."')";
//echo $dynaqry2;
$insert2 = mysqli_query($con,$dynaqry2);


  //mysql_query("INSERT INTO `interests` VALUES ('$userid','$topicid1')") ;

//$dynaqry2 = "select interestid from interestname where interestname = '".$topic."'";
	if (isset($_GET['callback']))
	{
		$callback = filter_var($_GET['callback'], FILTER_SANITIZE_STRING);
	}
//$data = "Success";


if ($UID==0)
  {
		echo "{\"result\":\"failure\"}";
		  $dynaqry3 = "INSERT INTO `log` (log) values('User auth:".$emailaddy." and returned FAILED')";
//echo $dynaqry2;
$insert3 = mysqli_query($con,$dynaqry3);
  }
else
  {
echo "{\"uid\":\"".$UID."\"}";
  }


 
 mysqli_close($con);
}

//mysql_query("select interestid from interestname = '$topic'");


?>