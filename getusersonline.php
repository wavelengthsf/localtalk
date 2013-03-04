<?php header('content-type: application/json; charset=utf-8');

	$mysql_user = 'root';
	$mysql_password = 'test12';
	$database = 'localtalk';

	$callback = '';
	
	if (isset($_GET['callback']))
	{
		$callback = filter_var($_GET['callback'], FILTER_SANITIZE_STRING);
	}

	$link = mysql_connect('ec2-50-112-223-94.us-west-2.compute.amazonaws.com', $mysql_user, $mysql_password);
	
	if (!$link) {
   	 	die('Could not connect: ' . mysql_error());
	}

	$db_selected = mysql_select_db($database, $link);
	
	if (!$db_selected) {
    	die ('Can\'t use foo : ' . mysql_error());
	}

	$result = mysql_query('SELECT id, username, pic FROM user WHERE isOnline = 1');
	
	if (!$result) {
    	die('Invalid query: ' . mysql_error());
	}

	while($r = mysql_fetch_assoc($result)) {
		 $data[] = $r;
   	}
	
	mysql_close($link);

	//echo $callback . '('.json_encode($data).')';
echo json_encode($data);
?>
