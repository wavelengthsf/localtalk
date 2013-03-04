<?php header('content-type: application/json; charset=utf-8');

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

	if (isset($_GET['lat']))
	{
		$lat = $_GET['lat'];
	//	echo "<br> Got latitude of: " . $lat;
	}

	if (isset($_GET['longt']))
	{
		$longt = $_GET['longt'];
				//echo "<br> Got longitude of: " . $longt;

	}

	$link = mysql_connect('ec2-50-112-223-94.us-west-2.compute.amazonaws.com', $mysql_user, $mysql_password);
	
	if (!$link) {
   	 	die('Could not connect: ' . mysql_error());
	}

	$db_selected = mysql_select_db($database, $link);
	
	if (!$db_selected) {
    	die ('Can\'t use foo : ' . mysql_error());
	}
    
	$result = mysql_query("UPDATE user SET lat = '$lat', longt = '$longt' WHERE id ='$userid'");
	
	if (!$result) {
			echo "{\"result\":\"failure\"}";

    	die('Invalid query: ' . mysql_error());
	} else {
			$localstring = "Lat: " . $lat . " Long: " . $longt . " UID: " . $userid;
			$result2 = mysql_query("insert log (log) values ('$localstring');");
		echo "{\"result\":\"success\"}";
	}
	


	
	mysql_close($link);
?>
