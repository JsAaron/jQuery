<?php

	$jsondata = "{symbol:'IBM', price:120}";  

	echo $_GET['callback'].'('.$jsondata.')';
	

	// $arr = array
	//        (
	//           'Name'=>'希亚',
	//           'Age'=>20
	//        );

	// $jsonencode = json_encode($arr);

	// echo $jsonencode;

?>