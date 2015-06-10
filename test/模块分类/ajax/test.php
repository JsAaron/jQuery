<?php

$act = trim($_GET['action']);

if($act == 'aaron' ){
    echo trim($_GET['backfunc']).'('. json_encode(array('status'=>1,'info'=>'OK')) .')';  
}

// $arr = array ('a'=>1,'b'=>2,'c'=>3,'d'=>4,'e'=>5); 

// echo json_encode($arr);

?>