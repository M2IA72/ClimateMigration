function changeClass(clicked_id) {

var element = document.getElementById(clicked_id);
  for (var i=1;i<=3;i++){
    document.getElementById('menu'+i).classList.remove('active');
	document.getElementById('menu'+i).setAttribute("class", "nav-link"); 
  }
  element.setAttribute("class", "active nav-link"); 
  document.getElementById('bc').style.display="None"
  document.getElementById('hm').style.display="None"
  
  switch(clicked_id){
	case 'menu1':
		console.log("On affiche la map");
		document.getElementById('wm').style.display="Flex";
		break;
	case 'menu2':
		console.log("On affiche la hexamap");
		document.getElementById('hm').style.display="Flex";
		break;
	case 'menu3':
		console.log("On affiche le barchart");
		document.getElementById('bc').style.display="Flex";
		break;
  }
}