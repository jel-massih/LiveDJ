<?php
	$body2 = strtolower($_POST['Body']);
	if (strpos($body2,'woo') !== false) {
		$ch = curl_init("http://192.241.169.33:8080?type=vote&v=1");
	}else if (strpos($body2,'boo') !== false) {
		$ch = curl_init("http://192.241.169.33:8080?type=vote&v=-1");
	}

    curl_exec($ch);
    curl_close($ch);
?>