<?php
	$body = strtolower($_POST['text']);
	include_once('../../APISearch/inc/twilioHandler.php');
	include_once('../../APISearch/inc/sendGridHandler.php');
	
	$file = file_get_contents("../../APISearch/inc/globalSettings.dat");
	if($file) {
		$thing = json_decode($file);
		if($thing->output == "#{body}") {
			$thing->output = $body;
		}
		print_r($thing);
		if($thing->type == "email") {
			sendMail($thing->recipient, "support@jel-massih.biz", "Foward: ".$_POST['subject'], $thing->output);
		} else if($thing->type == "call") {
			sendCall($thing->recipient, $thing->output);
		} else if($thing->type == "text") {
			sendSMS($thing->recipient, $thing->output);
		}
	}
?>