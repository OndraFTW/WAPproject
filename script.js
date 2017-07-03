/*
	Projekt: Webové apliace, WAP
	Autor: Ondřej Šlampa, xslamp01@stud.fit.vutbr.cz
*/

/*
    Vrátí právě vybraný prvek nebo null, pokud žádný prvek není vybraný.
*/
function getSelectedElement(){
	return document.selectedElement;
}

/*
    Vrátí element pro zobrazení v panelu DOM odpovídající zadanému elementu
    původní stránky.
*/
function getCodedElement(e){
	//pokud element nemá potomky
	if(e.childNodes.length==0){
		//element pro zobrazení
		var li=document.createElement("li");
		li.setAttribute("href","#");
		li.setAttribute("onClick","onClickLeft(event, this);return false;");
		li.appendChild(document.createTextNode(e.nodeName));
		//propojení elementu pro zobrazení a odpovídajícího elementu stránky
		li.pageElement=e;
		e.domElement=li;
		//pokud je element klikatelný přidá se trigger
		if(e.nodeType==1){
			//e.setAttribute("href","#");
			e.setAttribute("onClick","onClickRight(event, this);return false;");
		}
		return li
	}
	//pokud element má potomky
	else{
		//element pro zobrazení
		var li=document.createElement("li");
		//element seznamu potomků
		var ul=document.createElement("ul");
		ul.setAttribute("class", "item_list");
		li.setAttribute("href","#");
		li.setAttribute("onClick","onClickLeft(event, this);return false;");
		li.appendChild(document.createTextNode(e.nodeName));
		
		//zpracování potomků
		for(var i=0;i<e.childNodes.length;i++){
			//potomek
			var child=e.childNodes[i];
			//přeskočení nepohodlných potomků
			if(!(child.nodeType==1||child.nodeType==3||child.nodeType==9)){
			    continue;
			}
			
			//zpracování jednoho potomka
			var item=getCodedElement(child);
			//nastavení vizuální podoby v DOM panelu
			if(i%2==0){
				item.setAttribute("class", "even_item");
			}
			else{
				item.setAttribute("class", "odd_item");
			}
			ul.appendChild(item);
		}
		
		//propojení elementu pro zobrazení a odpovídajícího elementu stránky
		li.appendChild(ul);
		li.pageElement=e;
		e.domElement=li;
		//pokud je element klikatelný přidá se trigger
		if(e.nodeType==1){
			//e.setAttribute("href","#");
			e.setAttribute("onClick","onClickRight(event, this);return false;");
		}
		return li;
	}
}

//Pozice panelu s DOM.
var position="Left";

/*
    Změní pozici panelu s DOM.
*/
function onPositionChange(event, elem){
    var new_position=elem.value;
    if(new_position==position){
        return;
    }
    
    var panel=document.getElementById("dom_panel");
    if(new_position=="Right"){
        position="Right";
        panel.setAttribute("class", "float_right");
        document.body.removeChild(panel);
        document.body.appendChild(panel);
    }
    else{
        panel.setAttribute("class", "float_left");
        position="Left";
        document.body.removeChild(panel);
        document.body.insertBefore(panel,document.body.firstChild);
    }
}

/*
    Vrátí menu pro výběr pozice DOM panelu.
*/
function getPositionMenu(){
    var div=document.createElement("div");
    div.setAttribute("onclick", "doNothing(event, this);return false;");
    var select=document.createElement("select");
    select.setAttribute("onchange", "onPositionChange(event, this);return false;");
    //label
    var posLabel=document.createElement("label");
	posLabel.appendChild(document.createTextNode("Position:"));
	div.appendChild(posLabel);
    //vlevo
    var left=document.createElement("option");
    left.appendChild(document.createTextNode("Left"));
    left.setAttribute("label", "Left");
    select.appendChild(left);
    //vpravo
    var right=document.createElement("option");
    right.appendChild(document.createTextNode("Right"));
    right.setAttribute("label", "Right");
    select.appendChild(right);
    div.appendChild(select);
    return div;
}

/*
    Vrátí panel se zobrazeným DOM.
*/
function getLeft(){
	var div=document.createElement("div");
	//výběr pozice
	div.appendChild(getPositionMenu());
	var ul=document.createElement("ul");
	ul.setAttribute("class", "top_list");
	//zpracování elementu head
	var head=getCodedElement(document.head);
	head.setAttribute("class", "even_item");
	ul.appendChild(head);
	//zpracování elementu body
	var body=getCodedElement(document.body);
	body.setAttribute("class", "odd_item");
	ul.appendChild(body);
	div.appendChild(ul);
	div.setAttribute("id", "dom_panel");
	div.setAttribute("class", "float_left");
	return div;
}

/*
    Modifikace dokumentu při načtení stránky.
*/
function modifyDocument(){
	//DOM panel
	var left=getLeft();
	document.body.insertBefore(left, document.body.firstChild);
	
	//nastavení vybraného elementu
	document.selectedElement=null;
	
	//nalezení CSS stylu
	var url=document.getElementById("dom_wiever_script").getAttribute("src");
	url=url.split("/");
	url.pop();
	url.push("style.css");
	url=url.join("/");
	
	//vložení CSS stylů
	var link=document.createElement("link");
	link.setAttribute("type", "text/css");
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("href", url);
	
	document.head.appendChild(link);
}

/*
    Vrátí, jestli je daný element sudý.
*/
function isEven(e){
	var parent=e.parentElement;
	var i=0;
	for(;i<parent.childNodes.length;i++){
		if(parent.childNodes[i]==e){
			break;
		}
	}
	return i%2==0
}

/*
    Provede zrušení vybrání zadaného elementu.
*/
function deselectElement(e){
	if(e==null){
	    return;
	}
	//úprava zobrazení
	if(isEven(e)){
		e.setAttribute("class", "even_item");
	}
	else{
		e.setAttribute("class", "odd_item");
	}
	//pokud je element nastavitelný, odebere se formulář a zvýraznění
	if(e.pageElement.nodeType==1){
		e.removeChild(e.childNodes[1]);
		e.pageElement.classList.remove("highlight");
	}
}

/*
    Získá hodnotu atributu a elementu e. Pokud element nemá takový atribut,
    vrátí prázdný řetězec.
*/
function getAttributeOrEmpty(e, a){
	if(e.hasAttribute(a)){
		return e.getAttribute(a);
	}
	else{
		return "";
	}
}

/*
    Vrátí formulář pro editaci elementu e.
*/
function getForm(e){
	//vytvoření formuláře
	var form=document.createElement("form");
	form.setAttribute("class", "selected_form");
	form.setAttribute("name", "selected_form");
	form.setAttribute("onclick", "doNothing(event, this);return false;");
	form.setAttribute("onsubmit", "onSubmit(event, this);return false;");
	
	//label a textbox pro editaci id
	var idLabel=document.createElement("label");
	idLabel.appendChild(document.createTextNode("Id: "));
	form.appendChild(idLabel);
	var idInput=document.createElement("input");
	idInput.setAttribute("type", "text");
	idInput.setAttribute("name", "id");
	idInput.setAttribute("value", getAttributeOrEmpty(e.pageElement, "id"));
	idInput.setAttribute("contenteditable", "true");
	form.appendChild(idInput);
	form.appendChild(document.createElement("br"));
	
	//label a textbox pro editaci class
	var classLabel=document.createElement("label");
	classLabel.appendChild(document.createTextNode("Class: "));
	form.appendChild(classLabel);
	var classInput=document.createElement("input");
	classInput.setAttribute("type", "text");
	classInput.setAttribute("name", "class");
	classInput.setAttribute("value", getAttributeOrEmpty(e.pageElement, "class"));
	classInput.setAttribute("contenteditable", "true");
	form.appendChild(classInput);
	form.appendChild(document.createElement("br"));
	
	//tlačítko submit
	var submitInput=document.createElement("input");
	submitInput.setAttribute("type", "submit");
	submitInput.setAttribute("value", "Submit");
	submitInput.setAttribute("onclick", "onSubmit(event, this.parentElement);return false;");
	form.appendChild(submitInput);
	form.appendChild(document.createElement("br"));
	
	return form;
}

/*
    Vybere element e.
*/
function selectElement(e){
	if(e==null){
		return;
	}
	//zvýrazní element v DOM
	e.setAttribute("class", "selected_item");
	if(e.pageElement.nodeType==1){
		if(e.childNodes.length==1){
			e.appendChild(getForm(e));
		}
		else{
			var n=e.childNodes[1];
			e.insertBefore(getForm(e), n);
		}
		
		//zvýraznění elementu ve stránce
		e.pageElement.classList.add("highlight");
	}
	
	document.selectedElement=e;
}

/*
    Obslouží kliknutí na element v DOM panelu stránky.
    event událost kliknutí
    elem element, na který se kliklo
*/
function onClickLeft(event, elem){
	deselectElement(document.selectedElement);
	selectElement(elem);
	event.stopPropagation();
}

/*
    Obslouží kliknutí na element stránky.
    event událost kliknutí
    elem element, na který se kliklo
*/
function onClickRight(event, elem){
	deselectElement(document.selectedElement);
	selectElement(elem.domElement);
	event.stopPropagation();
}

/*
    Obslouží kliknutí, při kterém se nic nemá stát.
    event událost kliknutí
    elem element, na který se kliklo
*/
function doNothing(event, elem){
    event.stopPropagation();
}

/*
    Obslouží stisknutí tlačítka submit u formuláře.
    event událost kliknutí
    form formulář
*/
function onSubmit(event, form){
	var id_value=document.forms["selected_form"]["id"].value;
	var class_value=document.forms["selected_form"]["class"].value;
	var e=form.parentElement.pageElement;
	e.setAttribute("id",id_value);
	e.setAttribute("class",class_value);
	event.stopPropagation();
}

//při nahrání dokumentu se provede jeho modifikace
window.onload=function(){
	modifyDocument();
}

