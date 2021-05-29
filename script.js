let countryList=[];// a copy of the fetch response
let languageList=[]; //list of all languages
var timezoneList=[]; // list of all timezones
var currencyList=[]; //list of all currecncies
var searchItems=[]; // all country names, codes and capitals
let activeFilters={
    filterList : document.querySelector("active-filters"),
    currencyFilters : [],
    languageFilters : [],
    regionFilters : [],
    populationFilters : [],
    timezoneFilters : [],
    areFiltersActive : function(){
        return this.currencyFilters.length+this.languageFilters.length+this.regionFilters.length+this.populationFilters.length+this.timezoneFilters.length==0;
    },
    addCustomFilter : function(type){
        let newFilter="";
        switch(type){
            case "language":
                newFilter=document.querySelector(".language-input").value;
                if (!this.validateFilter(newFilter,languageList)){
                    throwWarning(`Invalid Filter! "${newFilter}" does not correspond to any Country`);
                    return ;
                }
                newFilter=this.cleanFilterName(languageList,newFilter);
                console.log(newFilter);
                if (!this.languageFilters.includes(newFilter)){
                    this.languageFilters.push(newFilter);
                    addCustomFilterToDoc("active-language-filters",newFilter);
                }
                else{
                    throwWarning(`Filter "${newFilter}" Already Exists!`);
                    return;
                }
                break;
            case "currency":
                newFilter=document.querySelector(".currency-input").value;
                if (!this.validateFilter(newFilter,currencyList)){
                    throwWarning(`Invalid Filter! "${newFilter}" does not correspond to any Country`);
                    return;
                }
                newFilter=this.cleanFilterName(currencyList,newFilter);
                if (!this.currencyFilters.includes(newFilter)){
                    this.currencyFilters.push(newFilter);
                    addCustomFilterToDoc("active-currency-filters",newFilter);
                }
                else{
                    throwWarning(`Filter "${newFilter}" Already Exists!`);
                    return;
                }
        }
    },
    removeCustomFilter : function(type,value,whiteSpaceValue){
        document.querySelector("#"+value).remove();
        switch(type){
            case "active-language-filters":
                this.languageFilters=this.languageFilters.filter(e => e!=value);
                break;
            case "active-currency-filters":
                this.currencyFilters=this.currencyFilters.filter(e => e!=whiteSpaceValue);
                break;
        }
    },
    validateFilter : function(value,list){
        if (list.map(e=>e.toUpperCase()).includes(value.toUpperCase())){
            return true;
        }
        return false;
    },
    cleanFilterName : function(arr,value){
        for (let i=0;i<arr.length;i++){
            if (arr[i].toLowerCase()==value.toLowerCase()){
                return arr[i];
            }
        }
        return value;
    },
    passesFilter(list,value){
        if (list.length==0){
            return true;
        }
        if (list.includes(value)){
            return true;
        }
        return false;
    },
    passesPopulationFilters : function(pop){
        if (this.populationFilters.length==0){
            return true;
        }
        return this.populationFilters.map(e => pop<e[1] && pop>e[0]).includes(true);
    },
    passesAllFilters : function(country){
        if (!this.areFiltersActive){
            return true;
        }
        if (this.passesFilter(this.regionFilters,country.region) && 
        country.timezones.map(e => this.passesFilter(this.timezoneFilters,e)).includes(true)
        && country.languages.map(e => this.passesFilter(this.languageFilters,e.name)).includes(true)
        && country.currencies.map(e => this.passesFilter(this.currencyFilters,e.name)).includes(true)){
            return this.passesPopulationFilters(country.population);
        }
        return false;
    }
};
//alert and modal events
let alerter=document.querySelector(".alert-div");
let modalClose=document.querySelector('.modal-close');
let modal=document.querySelector(".modal-bg");
window.onclick = function(event) {
    if (event.target == modal) { 
    toggleClassOff(modal,'modal-active');
    // modal.classList.remove('modal-active');
    }
    if (!event.target.classList.contains("autocomplete-span") && !event.target.classList.contains("add-custom")){
        toggleClassOff(alerter,"alert-active");
    }
}
modalClose.addEventListener('click', () => toggleClassOff(modal,'modal-active'));
// custom pop range in pop checkbox
function addCustomPopRange(){
    let popMin=parseInt(document.querySelector("#pop-min").value);
    let popMax=parseInt(document.querySelector("#pop-max").value);
    if (!isFinite(popMin) || !isFinite(popMax)){
        console.log("BAD");
        return ;
    }
    console.log (popMax,popMin,popMax<popMin);
    if (popMax<popMin){
        let temp=popMax;
        popMax=popMin;
        popMin=temp;
    }
    let popCheckList=document.querySelectorAll(".population-filter-checkbox");
    for (let i in popCheckList){
        if (popCheckList[i].id=="pop-range"+popMin+"-to-"+popMax){
            throwWarning("Population Range Exists!");
            return;
        }
    }
    let li=createCheckboxElement("pop-range"+popMin+"-to-"+popMax,"population-filter-checkbox",popMin+"-"+popMax);
    document.querySelector(".population-filter").insertBefore(li,document.querySelector(".custom-pop-inputs"));
}
//Initialise filters, searches and checklists. Only happens on successfull fetch
function initialiseFiltersAndButtons(){
    let addCustom=document.querySelector(".add-custom");
    let populationSelect=document.querySelector("#population-select");
    populationSelect.addEventListener('click',() =>{
        let populationFilter=document.querySelector(".population-filter");
        if (populationFilter.classList.contains("filter-active")){
            populationFilter.classList.remove("filter-active");
        }
        else{
            populationFilter.classList.add("filter-active");
        }
    });
    let regionSelect=document.querySelector("#region-select");
    regionSelect.addEventListener('click',() =>{
        let regionFilter=document.querySelector(".region-filter");
        if (regionFilter.classList.contains("filter-active")){
            regionFilter.classList.remove("filter-active");
        }
        else{
            regionFilter.classList.add("filter-active");
        }
    });
    document.getElementById("filter-btn").addEventListener("click",filter);
    document.querySelector(".search-span").addEventListener('click',search);
    document.querySelector(".add-language-filter").addEventListener('click',() => activeFilters.addCustomFilter("language"));
    document.querySelector(".add-currency-filter").addEventListener('click',() => activeFilters.addCustomFilter("currency"));
    document.querySelector(".add-custom-pop-range").addEventListener('click',addCustomPopRange);
    let timezoneSelect=document.querySelector("#timezone-select");
    timezoneSelect.addEventListener('click',() =>{
        let timezoneFilter=document.querySelector(".timezone-filter");
        if (timezoneFilter.classList.contains("filter-active")){
            timezoneFilter.classList.remove("filter-active");
        }
        else{
            timezoneFilter.classList.add("filter-active");
        }
    });
}

//Display filters added with the ADD buttons to active-filters
function addCustomFilterToDoc(type,value){
    let div=createNode("div");
    div.classList.add("custom-filter");
    let text=createTextNode(value);
    let x=createNode("span");
    x.appendChild(createTextNode("[X]"));
    x.classList.add("remove-filter");
    let whiteSpaceValue=value;
    value=value.replace(/\s+/g,"");
    div.id=value;
    x.addEventListener('click',()=>activeFilters.removeCustomFilter(type,value,whiteSpaceValue));
    div.appendChild(text);
    div.appendChild(x);
    document.querySelector("."+type).appendChild(div);
}

function addToSearchList(country){
    languageList=country.languages.map(language => language.name).filter(lan => !languageList.includes(lan)).concat(languageList);
    timezoneList=country.timezones.filter(zone => !timezoneList.includes(zone)).concat(timezoneList);
    currencyList=currencyList.concat(country.currencies.map(currency => currency.name).filter(currency => !currencyList.includes(currency)));
    searchItems.push(country.name,country.capital,country.numericCode);


}
// function hover(element, className){

//     element.addEventListener('mouseenter', e => element.classList.add(className));
//     element.addEventListener('mouseleave', e => element.classList.remove(className));
// }
// hover(addCustom,"hover");



function toggleClass(element,className){
    if (element.classList.contains(className)){
        toggleClassOff(element,className);
    }
    toggleClassOn(element,className);
}
function toggleClassOn(element,className){
    element.classList.add(className);
}
function toggleClassOff(element,className){
    element.classList.remove(className);
}
function throwWarning(text){
    alertDiv=document.querySelector(".alert-div");
    alertDiv.innerHTML=text;
    toggleClassOn(alertDiv,"alert-active");
}


function createCheckboxElement(name,className,value){
    let li=createNode("li");
    let inp=createNode("input");
    let label=createNode("label");
    let text=createTextNode(value);
    inp.className=className;
    inp.type="checkbox";
    inp.value=value;
    inp.name=name;
    inp.id=name;
    label.htmlFor=name;
    label.appendChild(text);
    li.appendChild(inp);
    li.appendChild(label);
    // parent.appendChild(li);
    return li;
}

function timezoneCheckListInit(){
    let ul=document.querySelector(".timezone-filter");
    timezoneList.map(tz => ul.appendChild(createCheckboxElement(tz,"timezone-filter-checkbox",tz)));
}

//filtering management
function searchByAlpha3(code){
    for (let i=0;i<countryList.length;i++){
        if (countryList[i].alpha3Code==code){
            return countryList[i];
        }
    }
}
function search(){
    let searchValue=document.querySelector(".country-input").value.toLowerCase();
    if(searchValue==""){
        throwWarning("Search bar is empty!");
        return;
    }
    let cards=document.getElementById("cards");
    cards.innerHTML="";
    for (const i in countryList){
        let country=countryList[i];
        if (country.numericCode==searchValue || country.capital.toLowerCase()==searchValue
        || country.name.toLowerCase()==searchValue){
            cards.appendChild(createCard(country,i));
        }
    }
    checkNoCards(cards);
}
function filter(){
    getCheckboxFilters();
    let cards=document.getElementById("cards");
    cards.innerHTML="";
    for (const i in countryList){
        let country=countryList[i];
        if (activeFilters.passesAllFilters(country)){
            cards.appendChild(createCard(country,i));
        }
    }
    checkNoCards(cards);
}
function printImg(src){
    let img=createNode("img");
    img.src=(src);
    cards.appendChild(img);
}
function checkNoCards(cards){
    if (cards.children.length==0){
        printImg("noresults.png");
    }
}

function getCheckboxFilters(){
    let regionChecklist=document.querySelectorAll(".region-filter-checkbox");
    let populationChecklist=document.querySelectorAll(".population-filter-checkbox");
    let timezonChecklist=document.querySelectorAll(".timezone-filter-checkbox");
    let regionFilters=[];
    let populationFilters=[];
    let timezoneFilters=[];
    for (let i=0;i<regionChecklist.length;i++){
        if (regionChecklist[i].checked){
            regionFilters.push(regionChecklist[i].value);
        }
    }
    for (let i=0;i<populationChecklist.length;i++){
        if (populationChecklist[i].checked){
        populationFilters.push(populationChecklist[i].value.split("-"));
        }
    }
    for (let i=0;i<timezonChecklist.length;i++){
        if (timezonChecklist[i].checked){
            timezoneFilters.push(timezonChecklist[i].value);
        }
    }
    activeFilters.regionFilters=regionFilters;
    activeFilters.populationFilters=populationFilters;
    activeFilters.timezoneFilters=timezoneFilters;
}

//end of filter check
//Simplify creating text nodes
function createTextNode(string){
    return document.createTextNode(string);
}
//simplify craeting nodes
function createNode(string){
    return document.createElement(string);
}
//Create a list of clickable neighbours that take you to their info (modal only)
function makeNeighbours(neighbours){
    div=createNode("div");
    div.classList.add("neighbours");
    neighbours.map((e,i,arr)=>{
        let span=createNode("span");
        span.classList.add("neighbour-span");
        let neighbourCountry=searchByAlpha3(e);
        span.addEventListener('click',()=>showModal(neighbourCountry));
        // console.log("i: ",i," len: ",arr.length-1, " bool: ",!(i===arr.length-1));
        let text=e;
        if (!(i===arr.length-1)){
            text=text+", ";
        }
        span.appendChild(createTextNode(text));
        // hover(span,"underline");
        div.appendChild(span);
    }
    );
    return div;
}
function showModal(country){
    toggleClassOn(modal,'modal-active');
    let div = document.createElement("div");
    modalContent= document.querySelector(".modal-content");
    div.className="modalCard";
    let area=country.area;
    if (area==null){
        area="unknown"; //some area values are null
    }
    let neigbours=makeNeighbours(country.borders);
    div=addInfoToDiv(div,[["",country.name],["Alpha2Code:",country.alpha2Code],["Capital:",country.capital],["Region:" ,country.region],
    ["Population:",country.population],["Latlng:",country.latlng],["Area:",area],["Timezones:",country.timezones]]);
    let currentTimes=country.timezones.map(e=>getHourAndMinutesByTimezone(e));
    if (currentTimes.length==1){
        div=addInfoToDiv(div,[["Current Time:",currentTimes]]);
    }
    else{
        div=addInfoToDiv(div,[["Current Times:",currentTimes]]);
    }
    div.appendChild(createTextNode("Neighbours: "));
    div.appendChild(neigbours);
    div.appendChild(createNode("br"));
    div=addInfoToDiv(div,[["Currecncies:",country.currencies.map(e=>e.name)],["Official Languages:",country.languages.map(e=>e.name)]]);
    img=document.createElement("img");
    img.src=country.flag;
    img.classList.add("modal-img");
    div.appendChild(img);
    modalContent.innerHTML="";
    modalContent.appendChild(div);
}
function createCard(country,i){
    let div = document.createElement("div");
    div.className="card";
    div.id="cardNo"+i;
    div=addInfoToDiv(div,[["",country.name],["Capital:",country.capital],["Region:",country.region],["Population:",country.population]]);
    img=document.createElement("img");
    img.src=country.flag;
    img.className="flaggy";
    img.id="img"+i;
    div.appendChild(img);
    div.addEventListener("click",() => showModal(country));
    return div;
}
function getHourAndMinutesByTimezone(timezone){
    let d=new Date();
    let h=d.getUTCHours();
    let m=d.getUTCMinutes();
    let offset=timezone.split("-");
    if (timezone.includes("-")){
        offset=getTimezoneOffsetFromString(timezone.split("-")[1]);
        if (m-offset[1]<0){
            if (h-1<0){
                h=23;
            }
            else{
                h--;
            }
            m+=60;
        }
        m-=offset[1];
        if (h-offset[0]<0){
            h+=24;
        }
        h-=offset[0];
        if (m<10){
            m=`0${m}`;
        }
        return `${h}:${m}`;
    }
    if (timezone.includes("+")){
        offset=getTimezoneOffsetFromString(timezone.split("+")[1]);
        if (m+offset[1]>60){
            if (h+1==24){
                h=0;
            }
            else{
                h++;
            }
            m-=60;
        }
        m+=offset[1];
        if (h+offset[0]>=24){
            h-=24;
        }
        h+=offset[0];
        if (m<10){
            m=`0${m}`;
        }
        return `${h}:${m}`;
    }
    if (m<10){
        m=`0${m}`;
    }
    return `${h}:${m}`;
}
function getTimezoneOffsetFromString(timezone){
    let rez=timezone.split(":");
    let h=rez[0];
    let m=rez[1];
    if (m.length==0){
        m=0;
    }
    else if(m=="00"){
        m=0;
    }
    if (h.includes("0")){
        h=h.substr(1);
    }
    h=parseInt(h);
    m=parseInt(m);
    return [h,m];
}
//adds children to a div with breaks in between
//div: the div
//info: [[ele1,ele2],[other1,other2]]
//looks like "ele1 ele2"<br> "other1 other2"
function addInfoToDiv(div,info,nobrk){
    info.map(e =>{
        div.appendChild(createTextNode(`${e[0]} ${e[1]}`));
        div.appendChild(createNode("br"));
    });
    return div;
}
//only happens on first (and only) fetch
//initialises the global lists at the top of the script
//initialises autocomplete forms,filters,checklists and buttons
function initialize(data){
    for (const item in data){
        addToSearchList(data[item]);
        document.getElementById("cards").appendChild(createCard(data[item],item));
    }
    languageList.sort();
    currencyList.sort();
    timezoneList.sort();
    currencyList=currencyList.filter(e => e!=null); // nauru has null currency
    searchItems=searchItems.filter(e => e!=null); // kosovo has null numeric code
    autocomplete(document.querySelector(".language-input"),languageList);
    autocomplete(document.querySelector(".currency-input"),currencyList);
    autocomplete(document.querySelector(".country-input"),searchItems);
    initialiseFiltersAndButtons();
    timezoneCheckListInit();

}

// fetch('https://restcountries.eu/rest/v2/all')
//     .then(rez => {
//         return rez.json();})
//     .then(data => {
//         console.log(data);
//         return data;});



fetch('https://restcountries.eu/rest/v2/all')
    .then (rez => rez.json())
    .then(data => 
    {
        countryList=data;
        initialize(data);
    // }).catch(error=>throwWarning("Could Not Connect To api ERROR:"+error+". TRY AGAIN"));
}).catch(error=>{
    printImg("network-error.png");
    throwWarning(`Could Not Connect To api ERROR: ${error}. TRY AGAIN`);});

function autocomplete(inp, arr) {
    var currentFocus;
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        for (i = 0; i < arr.length; i++) {
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            b = document.createElement("DIV");
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                b.addEventListener("click", function(e) {
                inp.value = this.getElementsByTagName("input")[0].value;
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          currentFocus++;
          addActive(x);
        } else if (e.keyCode == 38) { 
          currentFocus--;
          addActive(x);
        } else if (e.keyCode == 13) {
          e.preventDefault();
          if (currentFocus > -1) {
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
  } 