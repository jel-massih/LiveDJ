<?php

function createSalt() {
	$salt = substr(md5(uniqid(rand(), true)), 0, 8);
	return $salt;
}

function generateHash($password, $salt) {
	$hash = sha1($salt.$password);
	return $hash;	
}

function getSalt($username) {
}

function confirmuser($username, $password)
{
	global $userCollection;

	$password = stripslashes($password);
	
	$spass = getAuthInfo($username);
	if($spass == -1) {
		return 1;
	}
	
	if($password == $spass) {
		return 0;
	} else {
		return 2;
	}
}

function getAuthInfo($username) {
	return -1;
}


?> 