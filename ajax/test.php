<?php

$act = trim($_GET['action']);

if($act == 'aaron' ){
    echo trim($_GET['backfunc']).'('. json_encode(array('status'=>1,'info'=>'OK')) .')';  
}


	
?>