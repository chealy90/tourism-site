const URL = "landmarks.json"
let data
let keys
let sortOrder = 1
let currentSortField = null

let sortables = ["id", "name", "rating"]
let tagsList = new Set([])
let selectedTags



window.onload = () => {
    fetch(URL)
    .then(rawData => rawData.json())
    .then(jsonData => {
        data = jsonData
        keys = Object.keys(data[0])


        //get tags and display them
        data.forEach(row => {
            row["tags"].forEach(tag => {
                tagsList.add(tag)
            })
        })
        selectedTags = [...tagsList]
        let olElement = document.getElementById("tagsList")
        tagsList.forEach(tag => {
            let newLI = document.createElement("li")
            newLI.innerHTML = `<label>${tag}</label><input class="filterCB" type="checkbox" checked  value="${tag}" onchange="updateFilters()">`
            olElement.appendChild(newLI)
        })
        let newLI = document.createElement("li")
        newLI.innerHTML = `<label>other</label><input class="filterCB" type="checkbox" checked  value="other" onchange="updateFilters()">`
        olElement.appendChild(newLI)

        //initial display
        sort("id")
        displayTable(data)
        
    })  
}

function displayTable(displayData){
    //filter data
    displayData = displayData.filter(row => {
        let result = false
        //none selected selects all
        if (selectedTags.length===0){
            result = true
        } else {
            //direct match
            row["tags"].forEach(tag => {
                if (selectedTags.includes(tag)){
                    result = true
                }
            })
            //other selected includes those with no tags
            if (row["tags"].length===0 && selectedTags.includes("other")){
                result = true
            }
        }

        return result
    })



    //headers
    let htmlString = `<table><tr>`  
    keys.forEach(key => {
        htmlString += `<th onclick='${sortables.includes(key)?"sort(this.id)":"null"}'  id=${key}>${capitaliseFirstLetter(key)}${key===currentSortField? (sortOrder===1?'▲':'▼'):""}</th>`
        
    })
    htmlString += `</tr>`


    //table rows
    displayData.forEach(row => {
        htmlString += `<tr>`
        keys.forEach(key=> {
            if (key==="photosURLs"){
                htmlString += `<td><img class="tableImg" src=${row[key][0]}></td>`
            }
            else if (key==="tags"){
                htmlString += "<td><ul class='tagsList'>"
                let tags = row["tags"]
                tags.forEach(tag => {
                    htmlString += `<li>${tag}</li>`
                })
                htmlString += "</ul></td>"
            }
            
            else {
                htmlString += `<td>${row[key]}</td>`
            }
            
        })
        htmlString += `</tr>`
    })
    


        
htmlString += `</table>`
document.getElementById("mainContent").innerHTML = htmlString
}



function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}




function sort(field){
    if (field===currentSortField){
        sortOrder *= -1
    } else {
        sortOrder = 1
    }

    data.sort((a,b) => a[field] > b[field] ? 1*sortOrder : -1*sortOrder)
    currentSortField = field

    displayTable(data)
}


function searchData(searchTerm){
    if (searchTerm!==""){
        let exp = new RegExp(searchTerm, "i")
        let searchedData = data.filter(row => exp.test(row.name))
        displayTable(searchedData)
    }
}

function updateFilters(){
    selectedTags = []
    let checkboxes = [...document.getElementsByClassName("filterCB")]
    checkboxes.forEach(cb => {
        if (cb.checked){
            selectedTags.push(cb.value)
        }
    })
    console.log(selectedTags)
    displayTable(data)

    
    
}




/*
name, lat, long, address, description, phone, photos, tags, rating
▼▲
/*
TODO
fetch data
basic table

sort / search

---- create admin mode


add basic admin screen
basic edit
basic add
delete


*/