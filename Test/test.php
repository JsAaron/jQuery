<?php 
    header('Content-Type:text/json;charset=utf-8');
	$str = array
       (
          'Name'=>'xiaolou',
          'Age'=>20
       );

	$jsonencode = json_encode($str);
	echo $jsonencode;
?>

