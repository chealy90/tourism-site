const URL = "landmarks.json"
let data
let keys
let sortOrder = 1
let currentSortField = null

let sortables = ["id", "name", "rating"]



window.onload = () => {
    fetch(URL)
    .then(rawData => rawData.json())
    .then(jsonData => {
        data = jsonData
        keys = Object.keys(data[0])
        sort("id")
        displayTable(data)
    })  
}

function displayTable(displayData){
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
    console.log("heree")
    let exp = new RegExp(searchTerm, "i")
    console.log("here")
    let searchedData = data.filter(row => exp.test(row.name))
    console.log(searchedData)
    displayTable(searchedData)
}


/*
name, lat, long, address, description, phone, photos, tags, rating
▼▲
/*
TODO
fetch data
basic table

sort / search

---- fix the search, add a tr for empty results set

add basic admin screen
basic edit
basic add
delete


*/