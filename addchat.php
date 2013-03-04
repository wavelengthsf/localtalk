<?php header('content-type: application/json; charset=utf-8');

	$mysql_user = 'root';
	$mysql_password = 'test12';
	$database = 'localtalk';

	$callback = '';

// inputs 
//	userid: you want to get results near
//	dist: how far from userid

	if (isset($_GET['callback']))
	{
		$callback = filter_var($_GET['callback'], FILTER_SANITIZE_STRING);
	}

	if (isset($_GET['userid']))
	{
		$userid = $_GET['userid'];
	}

	if (isset($_GET['dist']))
	{
		$dist = $_GET['dist'];
	}

	if (isset($_GET['message']))
	{
		$message = $_GET['message'];
	}

	if (isset($_GET['lat']))
	{
		$lat = $_GET['lat'];
	}

	if (isset($_GET['longt']))
	{
		$longt = $_GET['longt'];
	}

	$link = mysql_connect('ec2-50-112-223-94.us-west-2.compute.amazonaws.com', $mysql_user, $mysql_password);
	
	if (!$link) {
   	 	die('Could not connect: ' . mysql_error());
	}

	$db_selected = mysql_select_db($database, $link);
	
	if (!$db_selected) {
    	die ('Can\'t use foo : ' . mysql_error());
	}


	// add chat message
	$insert_chat = "INSERT INTO `chat` (userID,message,lat,longt) values('".$userid."','".$message."','".$lat."','".$longt."')";

	$result = mysql_query($insert_chat);

	if (!$result) {
    	die('Invalid query: ' . mysql_error());
	}


	// return chat messages nearby
	// find user's latitude and longitude
	$result = mysql_query("SELECT lat, longt FROM user WHERE id = '$userid'");
	
	if (!$result) {
    	die('Invalid query: ' . mysql_error());
	}

	while($r = mysql_fetch_assoc($result)) {
		 $orig_lat = $r['lat'];
		 $orig_longt = $r['longt'];
   	}

   	echo $query;
   	// find circle from user's lat/long and return all results from the user table in that circle
	$query = "SELECT *, 3956 * 2 * ASIN(SQRT( POWER(SIN(('$orig_lat' -abs(dest.lat)) * pi()/180 / 2),2) + COS('$orig_lat' * pi()/180 ) * COS( abs(dest.lat) *  pi()/180) * POWER(SIN(('$orig_longt' - dest.longt) *  pi()/180 / 2), 2) )) as distance FROM chat dest, user u WHERE dest.userID = u.id having distance < '$dist' ORDER BY distance";

	$result = mysql_query($query);

	if (!$result) {
    	die('Invalid query: ' . mysql_error());
	}	
	
	while($r = mysql_fetch_assoc($result)) {
		 $data[] = $r;
   	}

	mysql_close($link);

	echo json_encode($data);

?>
