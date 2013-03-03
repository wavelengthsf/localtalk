<?php header('content-type: application/json; charset=utf-8');

	$mysql_user = 'test';
	$mysql_password = 'testing123';
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
	}

	if (isset($_GET['longt']))
	{
		$longt = $_GET['longt'];
	}

	$link = mysql_connect('localhost', $mysql_user, $mysql_password);
	
	if (!$link) {
   	 	die('Could not connect: ' . mysql_error());
	}

	$db_selected = mysql_select_db($database, $link);
	
	if (!$db_selected) {
    	die ('Can\'t use foo : ' . mysql_error());
	}
    
	$result = mysql_query("UPDATE user SET lat = '$lat', longt = '$longt' WHERE id ='$userid'");
	
	if (!$result) {
    	die('Invalid query: ' . mysql_error());
	} else {
		echo "{\"userid\":\"".$userid."\"}";
	}
	
	mysql_close($link);
?>
