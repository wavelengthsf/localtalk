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

	$link = mysql_connect('localhost', $mysql_user, $mysql_password);
	
	if (!$link) {
   	 	die('Could not connect: ' . mysql_error());
	}

	$db_selected = mysql_select_db($database, $link);
	
	if (!$db_selected) {
    	die ('Can\'t use foo : ' . mysql_error());
	}

	$result = mysql_query("select A.interestname from interestname A, interests B where B.userid='$userid'");
	
	if (!$result) {
    	die('Invalid query: ' . mysql_error());
	}

	while($r = mysql_fetch_assoc($result)) {
		 $data[] = $r;
   	}
	
	mysql_close($link);

	echo $callback . '('.json_encode($data).')';

?>
