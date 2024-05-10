const URL = "https://derek.comp.dkit.ie/java_script/example_code/dublin_attractions.json"
let data

window.onload = () => {
    fetch(URL)
    .then(rawData => rawData.json())
    .then(jsonData => {
        data = jsonData
    })
    
    console.log(data)
}


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