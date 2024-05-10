const URL = "landmarks.json"
let data
let keys

window.onload = () => {
    fetch(URL)
    .then(rawData => rawData.json())
    .then(jsonData => {
        data = jsonData
        keys = Object.keys(data[0])
        displayTable()
    })  
}

function displayTable(){
    //headers
    let htmlString = `<table><tr>`
    keys.forEach(key => {
        htmlString += `<th>${capitaliseFirstLetter(key)}</th>`
    })
    htmlString += `</tr>`

    //table rows
    data.forEach(row => {
        htmlString += `<tr>`
        keys.forEach(key=> {
            if (key==="photosURLs"){
                htmlString += `<td><img class="tableImg" src=${row[key][0]}></td>`
            } else {
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


/*
name, lat, long, address, description, phone, photos, tags, rating

/*
TODO
fetch data
basic table

sort / search

add basic admin screen
basic edit
basic add
delete


*/