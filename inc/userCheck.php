<?php 
	include ("database.php");

	global $db_link;


	if($q = $db_link->prepare("SELECT username FROM users WHERE username = ?"))
	{
		$user = strtolower($_POST['username']);
		$q->bind_param('s', $user);
		$q->execute();
		$q->store_result();
		if($q->num_rows == 0)
		{
			echo(1);
			exit;
		}
		echo(0);
		exit;
	}
?>