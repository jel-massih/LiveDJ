<?php
session_start();
include('database.php');
include("authorize.php");

function addNewUser($username, $password, $salt) {
	global $db_link;
	if($q = $db_link->prepare("INSERT INTO users (`username`, `password`, `salt`) VALUES (?, ?, ?)"))
	{
		$q->bind_param('sss', $username, $password, $salt);
		if($q->execute())
		{
			$q->close();
			return true;
		}
		echo($q->errno);
		$q->close();
	}
	return false;
}

if(isset($_POST['submit'])){
	
	if(!$_POST['username'] || !$_POST['password'] || !$_POST['password_confirm']) {
		die('You Didnt Fill in a Required Field.');
	}
	
	$_POST['username'] = trim($_POST['username']);
	
	if(userTaken($_POST['username'])) {
		$use = $_POST['username'];
		die("Sorry, the User: <strong>$use</strong> is already taken.");
	}
	
	$_POST['password'] = trim($_POST['password']);
	if(strlen($_POST['password']) < 8)
	{
		die("Your Password needs to be at least 8 characters.");
	}
	
	if($_POST['password'] != $_POST['password_confirm'])
	{
		die("Passwords do not match");
	}
	
	$salt = createSalt();
	$md5Pass = generateHash($_POST['password'], $salt);
	addNewUser($_POST['username'], $md5Pass, $salt);
	return;
}