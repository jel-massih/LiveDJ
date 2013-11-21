<?php
include_once('database.php');
include_once('authorize.php');

if(isset($_POST['loginbtn'])) {
	$error_code = 0;
	if(!$_POST['username'] || !$_POST['password']) {
		$error_code = 1;
	}
	
	$_POST['username'] = trim($_POST['username']);
	$hash = sha1(getSalt($_POST['username']).$_POST['password']);
	$result = confirmuser($_POST['username'],$hash);
	
	if($result == 1 || $result == 2) {
		$error_code = 1;
	} else if($result == 3) {
		$error_code = 2;
	}

	$_POST['username'] = stripslashes($_POST['username']);
	return;
}
?>