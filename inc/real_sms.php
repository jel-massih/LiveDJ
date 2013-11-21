<?php
	$body2 = strtolower($_POST['Body']);
	if (strpos($body2,'woo') !== false) {
		$ch = curl_init("http://162.243.61.109:8080?type=vote&v=1");
	}else if (strpos($body2,'boo') !== false) {
		$ch = curl_init("http://162.243.61.109:8080?type=vote&v=-1");
	}

    curl_exec($ch);
    curl_close($ch);
?>