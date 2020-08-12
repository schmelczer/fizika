<?php
$servername = "localhost";
$username = "admin";
$password = "6JCFKSTNGDyw";
$dbname = "fizika";
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

$numbers = range(0, 495);
$isSearch = $_POST['isSearch'];

if(!$isSearch) {
    shuffle($numbers);
    $NOQ = $_POST['NOQ'];
    $where = " type='0'";
    if($_POST['mk']){
        $where .= "OR type='mk'";
    }
    if($_POST['md']){
        $where .= "OR type='md'";
    }
    if($_POST['me']){
        $where .= "OR type='me'";
    }
    if($_POST['mf']){
        $where .= "OR type='mf'";
    }
    if($_POST['mr']){
        $where .= "OR type='mr'";
    }
    if($_POST['h']){
        $where .= "OR type='h'";
    }
    if($_POST['es']){
        $where .= "OR type='es'";
    }
    if($_POST['ee']){
        $where .= "OR type='ee'";
    }
    if($_POST['ev']){
        $where .= "OR type='ev'";
    }
    if($_POST['m']){
        $where .= "OR type='m'";
    }
    if($_POST['o']){
        $where .= "OR type='o'";
    }
    if($_POST['ah']){
        $where .= "OR type='ah'";
    }
    if($_POST['am']){
        $where .= "OR type='am'";
    }
    if($_POST['cs']){
        $where .= "OR type='cs'";
    }
    if($_POST['v']){
        $where .= "OR type='v'";
    }
}
else {
    if(strlen($_POST['source']) > 9) return;
    $where = " source LIKE '".$_POST['source']."'";
    $NOQ = 495;
}
$done=0;
for ($i=0; $i <= 495; $i++) {
    $sql = "SELECT ID, source, descr, ans1, ans2, ans3, ans4, correct, type, pic FROM fizika WHERE ID=$numbers[$i] AND (". $where.")";
    $result = $conn->query($sql);
        while($row = $result->fetch_assoc()) {
             echo '<div class="feladat card" id="feladat'.$row['ID'].'"> ';
             echo '<h2 style="float: left;">'.($done+1).'.</h2><h2>'.$row['source'].'</h2>';
             echo '<pre>'.$row['descr'].'</pre>';
             if($row['pic']){
                 if($row['ID'] > 435){
                    echo '<img src="pics/'.$row['pic'].'.png"><br>';
                 }
                 else {
                    echo '<img src="pics/'.$row['pic'].'.JPG"><br>';
                 }
             }
             echo '<form id="form'.$row['ID'].'"">
             <input type="radio" id="rad1" name="group">
             <label id="label'.$row['ID'].'" class="rad1">'.$row['ans1'].'</label>
             <br>
             <input type="radio" id="rad2" name="group">
             <label id="label'.$row['ID'].'" class="rad2">'.$row['ans2'].'</label>
             <br>
             <input type="radio" id="rad3" name="group">
             <label id="label'.$row['ID'].'" class="rad3">'.$row['ans3'].'</label>
             <br>';
             if($row['ans4']){
                 echo '<input type="radio" id="rad4" name="group">
                 <label id="label'.$row['ID'].'" class="rad4">'.$row['ans4'].'</label>
                 <br>';
             }
             echo '</form>';
             echo '<script type="text/javascript">
                    $(document).ready(function(){
                        totalPoints++;
                         $("#ans").click(function(event){
                            event.preventDefault();
                            teszt('.$row['ID'].','.$row['correct'].');    
                        });
                        $("#cAns").click(function(event){
                            event.preventDefault();
                            showCorrect('.$row['ID'].','.$row['correct'].');
                        });
                    });';
             echo  ' </script>';
             echo '</div>';
             $done++;
            }
 if($done == $NOQ){
    break;
     } 
}
if($done == 0){
    echo '<div class="buttonwrapper"><b style="font-size: 2rem;">Nem található a keresésnek megfelelő feladat!</b></div>';
}
 echo '<script type="text/javascript">
            startTimer = 1;
            timer = 0;';
        '</script>';
$conn->close();
?>
